# NoteGuard

### [🔥 NoteGuard App](https://raais.github.io/noteguard)

A ~~local-first~~ **local-only**, encrypted notes vault.

- User authenticates with a secure 256-bit private key
- Vault box is an encrypted SQLite db file
- Encryption with [XChaCha20-Poly1305](https://github.com/team-reflect/kiss-crypto)
- Key split using [SLIP-0039](https://github.com/satoshilabs/slips/blob/master/slip-0039.md)

Built with

- [TinyBase](https://tinybase.org/)
- [sqlite-wasm](https://github.com/sqlite/sqlite-wasm)
- [kiss-crypto](https://github.com/team-reflect/kiss-crypto)
- [Quill](https://quilljs.com/)

## Run

    npm install
    npm run dev

## License

MIT
