export default function htmlEntities(str: string): string {
    return String(str).replace(/&/g, '%26').replace(/=/g, '%3d');
}