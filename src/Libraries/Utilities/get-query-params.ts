export default function getParam(param: string): string {
    const urlParams = new URLSearchParams(window.location.search);

    return urlParams.get(param);
}
