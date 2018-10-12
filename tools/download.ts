import axios, { AxiosResponse } from 'axios';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';

import Nestease from '@module/netease'
import { mkdirsSync } from '@util';

import { ISong } from '@model/song';

const basePath: string = path.resolve(__dirname, '../media');
const [start = 0, length = 10]: number[] = process.argv.slice(2).map((x: string): number => Number.parseInt(x, 10));

if (!fs.existsSync(basePath)) {
    mkdirsSync(basePath);
}

const outFile: fs.WriteStream = fs.createWriteStream(path.resolve(basePath, 'media.zip'));
const archive: archiver.Archiver = archiver('zip', {
    zlib: {
        level: 9,
    },
});
archive.pipe(outFile);

Nestease.playlistDetail(95815468, start, length).then(async (data: ISong[]): Promise<void> => {
    for (const { track, id } of data) {
        const res: AxiosResponse<Buffer> = await axios.get(track, {
            responseType: 'stream',
        });
        archive.append(res.data, { name: `${id}.mp3` });
    }
    archive.append(
        JSON.stringify(
            data.map((item: ISong): ISong => {
                item.track = `/assets/dist/media/${item.id}.mp3`;
                return item;
            }),
        ),
        { name: 'data.json' },
    );
    archive.finalize();
});
