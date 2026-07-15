/** Mock do expo-file-system, API nova do SDK 54 (File/Paths) — jest não tem FS nativo. */
export const Paths = { cache: { uri: 'file:///mock-cache' } };

const written: Record<string, Uint8Array> = {};

export class File {
  readonly uri: string;

  constructor(base: { uri: string } | string, name?: string) {
    const baseUri = typeof base === 'string' ? base : base.uri;
    this.uri = name ? `${baseUri}/${name}` : baseUri;
  }

  write(bytes: Uint8Array) {
    written[this.uri] = bytes;
  }
}

export const __getWrittenFiles = () => written;
export const __resetWrittenFiles = () => {
  for (const key of Object.keys(written)) delete written[key];
};
