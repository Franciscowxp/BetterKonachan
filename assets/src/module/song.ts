import { getStream } from '~service';
import { IServiceRes } from '~cModel/service';

class Song implements ISong {
    public static size: number = 128;
    public ac: AudioContext;
    public duration!: number;
    public id: number;
    public canvas: HTMLCanvasElement;
    public gainNode: GainNode;
    public volume: number;
    public analyserNode: AnalyserNode;
    public bufferSource!: AudioBufferSourceNode;
    public activeData: IVueData;
    public stopStatus: boolean = true;
    constructor({ volume, id, canvas, activeData }: { volume: number; id: number; canvas: HTMLCanvasElement; activeData: IVueData }) {
        this.id = id;
        this.canvas = canvas;
        this.volume = volume;
        this.activeData = <IVueData>activeData;
        this.ac = new AudioContext();
        this.gainNode = this.ac.createGain();
        this.analyserNode = this.ac.createAnalyser();
        this.analyserNode.fftSize = Song.size * 2;
        this.analyserNode.connect(this.gainNode);
        this.gainNode.connect(this.ac.destination);
        this.bufferSource = this.ac.createBufferSource();
        this.setVolume();
        this.load();
    }
    public static parseTime(time: number): string {
        const t: number = Math.trunc(time);
        const is2b: (n: number) => string = (num: number): string => {
            let result: string;
            if (num < 10) {
                result = `0${num}`;
            } else {
                result = `${num}`;
            }

            return result;
        };
        const min: number = Math.floor(t / 60);
        const sec: number = Math.floor(t - (min * 60));

        return `${is2b(min)}:${is2b(sec)}`;
    }

    public seek(sec: number): void {
        this.bufferSource.start(sec);
    }
    public setVolume(vo: number = this.volume): void {
        this.gainNode.gain.value = vo;
    }
    public pause(): void {
        this.stopStatus = true;
        this.ac.suspend();
    }
    public mute(): void {
        this.gainNode.gain.value = this.gainNode.gain.value ? 0 : this.volume;
    }
    public play(): void {
        this.ac.resume();
        this.stopStatus = false;
        this.visualizer();
    }
    public stop(): void {
        getStream.cancel();
        if (!this.stopStatus) {
            this.bufferSource.stop();
            this.clearDraw();
            this.stopStatus = true;
        }
    }
    public end(): Promise<string> {
        return new Promise((resolve: (str: string) => void): void => {
            this.bufferSource.addEventListener('ended', () => {
                let typeName: string = 'manual';
                if (this.ac.currentTime >= this.duration) {
                    typeName = 'auto';
                }
                resolve(typeName);
            });
        });
    }
    public async load(): Promise<void> {
        const res:  = await getStream.http({ params: { id: this.id }});
        if (res.status && res.status === 200) {
            const buffer = await this.ac.decodeAudioData(res.data);
            this.bufferSource.connect(this.analyserNode);
            this.bufferSource.buffer = buffer;
            this.bufferSource.start();
            this.stopStatus = false;
            this.duration = this.bufferSource.buffer.duration;
            this.activeData.totalTime = Song.parseTime(this.duration);
            this.visualizer();
        }
    }
    public visualizer() {
        const arr = new Uint8Array(this.analyserNode.frequencyBinCount);
        const anima = (): boolean | void => {
            if (this.stopStatus || (this.ac.currentTime > this.duration)) { return false; }
            this.analyserNode.getByteFrequencyData(arr);
            this.draw(arr);
            this.activeData.playedTime = Song.parseTime(this.ac.currentTime);
            this.activeData.playedPercentage.width = `${this.ac.currentTime / this.duration * 100}%`;
            requestAnimationFrame(anima);
        };
        requestAnimationFrame(anima);
    }
    public clearDraw() {
        const { width, height, ctx } = this.getCtx();
        ctx.clearRect(0, 0, width, height);
    }
    public draw(arr: Uint8Array) {
        const { width, height, ctx } = this.getCtx();
        // const line = ctx.createLinearGradient(0, 0, 0, height);
        const w = width / Song.size;
        ctx.globalAlpha = 0.1;
        // line.addColorStop(0, 'red');
        // line.addColorStop(0.5, 'yellow');
        // line.addColorStop(1, 'green');
        // ctx.fillStyle = line;
        ctx.fillStyle = '#39CCCC';
        ctx.clearRect(0, 0, width, height);
        arr.forEach((item: number, i: number) => {
            const h = item / (Song.size * 2 ) * height;
            ctx.fillRect(w * i, height - h, w * .6, h);
        });
    }
    private getCtx() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        const ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        return { width, height, ctx };
    }
}

export default Song;
