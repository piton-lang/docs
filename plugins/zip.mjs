// A minimal ZIP writer, used by src/pages/downloads/[project].zip.ts to pack
// each project under examples/ into the archive its tutorial links.
//
// Written by hand rather than pulled from a library. A ZIP holding a dozen
// small text files is a local header per entry, a central directory, and an
// end-of-central-directory record; zlib does the only hard part. That is less
// to keep working than a dependency, and `zip` is not on every machine that
// builds this site.
import { deflateRawSync, crc32 } from 'node:zlib';

/*
 * A fixed timestamp, so an unchanged example produces a byte-identical archive
 * and the site's output does not churn on every build. 1980-01-01 00:00:00 is
 * the zero of the DOS date format ZIP uses, which is the only date it has.
 */
const DOS_EPOCH = 0x00210000;

/** Minimal ZIP writer: deflate every entry, then the central directory. */
export function zip(entries) {
	const chunks = [];
	const central = [];
	let offset = 0;

	for (const { name, data } of entries) {
		const nameBuf = Buffer.from(name, 'utf8');
		const deflated = deflateRawSync(data);
		// Storing is smaller than deflating when deflate does not pay off.
		const stored = deflated.length >= data.length;
		const body = stored ? data : deflated;
		const method = stored ? 0 : 8;
		const sum = crc32(data);

		const local = Buffer.alloc(30);
		local.writeUInt32LE(0x04034b50, 0); // local file header
		local.writeUInt16LE(20, 4); // version needed
		local.writeUInt16LE(0x0800, 6); // flags: UTF-8 names
		local.writeUInt16LE(method, 8);
		local.writeUInt32LE(DOS_EPOCH, 10); // time and date
		local.writeUInt32LE(sum, 14);
		local.writeUInt32LE(body.length, 18);
		local.writeUInt32LE(data.length, 22);
		local.writeUInt16LE(nameBuf.length, 26);
		chunks.push(local, nameBuf, body);

		const dir = Buffer.alloc(46);
		dir.writeUInt32LE(0x02014b50, 0); // central directory header
		dir.writeUInt16LE(20, 4); // version made by
		dir.writeUInt16LE(20, 6); // version needed
		dir.writeUInt16LE(0x0800, 8);
		dir.writeUInt16LE(method, 10);
		dir.writeUInt32LE(DOS_EPOCH, 12);
		dir.writeUInt32LE(sum, 16);
		dir.writeUInt32LE(body.length, 20);
		dir.writeUInt32LE(data.length, 24);
		dir.writeUInt16LE(nameBuf.length, 28);
		// Unix mode in the high half; `<<` is signed in JS, so unsign it.
		dir.writeUInt32LE((0o100644 << 16) >>> 0, 38); // external attrs
		dir.writeUInt32LE(offset, 42);
		central.push(dir, nameBuf);

		offset += local.length + nameBuf.length + body.length;
	}

	const dirBuf = Buffer.concat(central);
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054b50, 0); // end of central directory
	end.writeUInt16LE(entries.length, 8);
	end.writeUInt16LE(entries.length, 10);
	end.writeUInt32LE(dirBuf.length, 12);
	end.writeUInt32LE(offset, 16);

	return Buffer.concat([...chunks, dirBuf, end]);
}
