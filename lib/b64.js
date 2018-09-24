const isBrowser = typeof window !== 'undefined';

function browserToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function browserFromBase64(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function toBase64(str) {
  let buffer;
  if (str instanceof Buffer) {
    buffer = str;
  } else {
    buffer = Buffer.from(str.toString(), 'binary');
  }
  return buffer.toString('base64');
}

const o = {
  to(buf) {
    let b;
    if (isBrowser) {
      b = browserToBase64(buf);
    } else {
      b = toBase64(buf);
    }
    return b;
  },

  from(base64) {
    let b;
    if (isBrowser) {
      b = browserFromBase64(base64);
    } else {
      b = Buffer.from(base64, 'base64');
    }
    return b;
  }
};

exports = o;
