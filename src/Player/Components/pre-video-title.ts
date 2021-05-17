export default function setPreVideoTitle(text: string): HTMLParagraphElement {
    const preTitle = document.createElement('p');
    preTitle.innerHTML = text;
    preTitle.className = 'dm__pre-video-title';

    return preTitle;
}