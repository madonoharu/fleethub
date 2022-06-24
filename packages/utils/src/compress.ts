interface DecompressionStream {
  readonly writable: WritableStream<BufferSource>;
  readonly readable: ReadableStream<Uint8Array>;
}

type Format = "gzip" | "deflate";

declare const DecompressionStream: {
  prototype: DecompressionStream;
  new (format: Format): DecompressionStream;
};

interface CompressionStream {
  readonly writable: WritableStream<BufferSource>;
  readonly readable: ReadableStream<Uint8Array>;
}

declare const CompressionStream: {
  prototype: CompressionStream;
  new (format: Format): CompressionStream;
};

export async function compress(input: string): Promise<ArrayBuffer> {
  const cs = new CompressionStream("gzip");

  const writer = cs.writable.getWriter();
  const chunk = new TextEncoder().encode(input);
  void writer.write(chunk);
  void writer.close();

  return new Response(cs.readable).arrayBuffer();
}

compress.supports =
  typeof window !== "undefined" && "CompressionStream" in window;
