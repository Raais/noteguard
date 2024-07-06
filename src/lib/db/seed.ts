import { Tables, Values } from "tinybase";

export const initTables: Tables = {
  notes: {
    "1720256876": {
      content: "<h1><strong>Welcome to NoteGuard</strong></h1><h3>A place for your secrets...</h3><p>	(<em>it&#39;s actually just an encrypted vault</em>)</p><p></p><ul><li>Stored locally (no cloud, no browser storage)</li><li>Secure encryption - <a href=\"https://github.com/team-reflect/kiss-crypto\" rel=\"noopener noreferrer\" target=\"_blank\">XChaCha20-Poly1305</a></li><li>SQLite DB file</li></ul><p></p><p>Only <em>you</em> can lock and unlock your vault (.box)</p><ul><li>Your seed words are like a password</li><li>Don&#39;t share them with anyone</li><li>It&#39;s used to construct a <strong>secure</strong> 256-bit encryption key</li></ul><p></p><h3><strong>Get started by creating a new note</strong></h3><p>Click the plus button above, or use hotkeys:</p><p></p><p><strong>(alt) ⌥ + n  </strong>-  open a new note</p><p><strong>(alt) ⌥ + o  </strong>-  open and unlock an encrypted box</p><p><strong>(alt) ⌥ + x  </strong>-  lock and save your box</p>",
    },
    "1720256877": {
      content: "<h1><strong>Whats under the hood?</strong></h1><p>(here&#39;s what: <a href=\"https://github.com/raais/noteguard\" rel=\"noopener noreferrer\" target=\"_blank\">github.com/raais/noteguard</a>)</p><p></p><p>This is a l̶o̶c̶a̶l̶-̶f̶i̶r̶s̶t̶ local-only, client-side React app with no server magic.</p><p></p><p>All your notes are stored <em>in-memory</em> in a <a href=\"https://tinybase.org/\" rel=\"noopener noreferrer\" target=\"_blank\">TinyBase</a> store which gets persisted to a <em><a href=\"https://tinybase.org/api/persister-sqlite-wasm/\" rel=\"noopener noreferrer\" target=\"_blank\">in-memory</a></em><a href=\"https://tinybase.org/api/persister-sqlite-wasm/\" rel=\"noopener noreferrer\" target=\"_blank\"> SQLite db</a>. You can see everything in store by clicking the little black-and-pink icon at the bottom.</p>",
    },
    "1720256878": {
      content: "<h1><strong>Don&#39;t refresh...</strong></h1><p></p><p>NoteGuard is a client-side app. There is no session persistence.</p><p></p><p>We <em>could</em> store your private key in browser storage, but your key is too... <em>private</em>.</p><p>It doesn&#39;t expire, it can&#39;t be reset. It&#39;s the single point of access to your encrypted vaults.</p><p></p><p>So you <strong>must</strong> authenticate every time you come back.</p>",
    },
    "1720256879": {
      content: "<h1><strong>Encryption</strong></h1><p></p><p>When you click the lock button</p><ul><li>Your vault of notes gets exported as a SQLite db file</li><li>This file gets encrypted with a <a href=\"https://en.wikipedia.org/wiki/ChaCha20-Poly1305#Variants\" rel=\"noopener noreferrer\" target=\"_blank\">secure encryption algorithm</a> using your private key</li><li>The encrypted file is downloaded, and you are logged out</li></ul><p></p><p><strong>This file can only be unlocked using the same encryption key.</strong></p><ul><li>you can see the key&#39;s alias as a convenient username like { <em>silly-goose </em>}</li></ul><p></p><p>To unlock an encrypted vault, click the Open button and select the .box file.</p><p></p><p></p><h3><strong>Authentication</strong></h3><p>Your seed words are generated using a secure secret-sharing-algorithm and cryptographic specification: <a href=\"https://github.com/satoshilabs/slips/blob/master/slip-0039.md\" rel=\"noopener noreferrer\" target=\"_blank\">SLIP39</a>. Check it out yourself: <a href=\"https://iancoleman.io/slip39/\" rel=\"noopener noreferrer\" target=\"_blank\">here</a></p>",
    },
    "1720256880": {
      content: "<h1><strong>17地コメヲ経東むもまッ</strong></h1><p></p><p>調ヱヒハ明要エク質抗稿なぴりこ活26備びだ名日6本ルキ掲記煙一むほあ沿興スぎまわ影1万べろょに町応び題合クム撃量乞伍佛ら。費場影ねず号実会ッ速康コス拠乗リト供大能せぼ護碁ぐでなず白色チエソ奈将こけ話3栄マウシテ果世ムケ府逮タナヱヒ定仰巣毅閲のンう。</p><p></p><p>初ぽど性楠チフノヨ暮撲必ょ変保ぴ更宝ウ情愛のふがゃ題今ヲヘフ炭索でえス提投ふぎへ世情明うフだ意帯ヨ決換ず本他つえおれ。敗9反へぱめ開延ムアヘ貫廊リヲヌト動1動裁隊ニ撃佑ぱてょろ文読フ速内ヘ機男の百89型7喫羅踊ッざぶ。認ウヤミ台斉奥エレネ問反でぶスさ外授ノチ著第違はっに酔見ラう薫60線ツワ火芸ヒ旅社ゆ西役治うドっ惑弁びろとぱ。</p><p></p><p>小ゃくゅ運育ケ米1備へすをず連界葉ルセ改無ト比購ソ護民クぱかむ背再8分だ撃際モヒイ持墓ウケ表島ヨヲムノ浮図ゃしだか事事向ヲテ高国スレほ下量もラぞと未危周英受で。層ニ素方ぶ覧朝則ぴ日加そッづ登問込ハ主息さゅ辞類ど十致ロ芸4指つせ間日み玉改ハマトウ欺冠まわぞや初下件長セコ指者不スエヒロ案官軍費設じむど。</p><p></p><p>止ヘ事条へのぶだ夏想えら生文ょ写手リ文以投よぽもだ医島ソト立韓外ゅぽよ決69属提ルユサ導若そ日都ヘテサ第込ご現気ホネ及体シネソラ受害ごきクう環漫腹ぱづぞら。覇りきらぜ容写らリおじ通日12帳なリやぶ断低得けえ洋天ウ民56朝テモヤ危京顕規イ条法リぐずレ助政トヱミク試状ヤニ査経だじごい発57霊佑4県券芝漢スびいト。</p>",
    },
    "1720256881": {
      content: "<h1><strong>What&#39;s next?</strong></h1><p></p><p><strong>You tell me</strong>: <a href=\"https://github.com/raais/noteguard/issues\" rel=\"noopener noreferrer\" target=\"_blank\">issues</a> / <a href=\"https://github.com/raais/noteguard/pulls\" rel=\"noopener noreferrer\" target=\"_blank\">pull requests</a></p><p></p><p>Planned features</p><ul><li><a href=\"https://developers.google.com/identity/passkeys\" rel=\"noopener noreferrer\" target=\"_blank\">Passkey</a> password-less login (eg. iCloud Keychain, TouchID)</li><li><em>This might be possible soon if <a href=\"https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API\" rel=\"noopener noreferrer\" target=\"_blank\">WebAuthn</a> providers implement a way to derive symmetric keys</em></li></ul><p></p>",
    },
  },
};

export const initValues: Values = {
  opened: "1718691612",
};
