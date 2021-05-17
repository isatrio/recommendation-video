export default class VideoTitle {
    private titleEl: HTMLParagraphElement = null;

    public setVideoTitle(text: string): HTMLParagraphElement {
        this.titleEl = document.createElement('p');
        this.titleEl.innerHTML = text;
        this.titleEl.className = 'dm__video-title';

        return this.titleEl;
    }

    private cleanup(): void {
        delete this.titleEl;
        this.titleEl.remove();
    }

}
