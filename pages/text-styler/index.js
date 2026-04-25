// pages/text-styler/index.js
// Pure client-side Unicode text transformation — NO API KEY needed
import Head from 'next/head';
import { useState } from 'react';
import Layout from '../../components/Layout';
import ToolStats from '../../components/ToolStats';

// Unicode character maps
const transformers = {
  'Bold': str => str.replace(/[A-Za-z0-9]/g, c => {
    const codes = { A:0x1D400,a:0x1D41A,0:0x1D7CE };
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(codes.A + c.charCodeAt(0) - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(codes.a + c.charCodeAt(0) - 97);
    if (c >= '0' && c <= '9') return String.fromCodePoint(codes[0] + c.charCodeAt(0) - 48);
    return c;
  }),
  'Italic': str => str.replace(/[A-Za-z]/g, c => {
    if (c === 'h') return '𝘩';
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x1D434 + c.charCodeAt(0) - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x1D44E + c.charCodeAt(0) - 97);
    return c;
  }),
  'Bold Italic': str => str.replace(/[A-Za-z]/g, c => {
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x1D468 + c.charCodeAt(0) - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x1D482 + c.charCodeAt(0) - 97);
    return c;
  }),
  'Script': str => str.replace(/[A-Za-z]/g, c => {
    const map = { A:'𝒜',B:'ℬ',C:'𝒞',D:'𝒟',E:'ℰ',F:'ℱ',G:'𝒢',H:'ℋ',I:'ℐ',J:'𝒥',K:'𝒦',L:'ℒ',M:'ℳ',N:'𝒩',O:'𝒪',P:'𝒫',Q:'𝒬',R:'ℛ',S:'𝒮',T:'𝒯',U:'𝒰',V:'𝒱',W:'𝒲',X:'𝒳',Y:'𝒴',Z:'𝒵',a:'𝒶',b:'𝒷',c:'𝒸',d:'𝒹',e:'ℯ',f:'𝒻',g:'ℊ',h:'𝒽',i:'𝒾',j:'𝒿',k:'𝓀',l:'𝓁',m:'𝓂',n:'𝓃',o:'ℴ',p:'𝓅',q:'𝓆',r:'𝓇',s:'𝓈',t:'𝓉',u:'𝓊',v:'𝓋',w:'𝓌',x:'𝓍',y:'𝓎',z:'𝓏' };
    return map[c] || c;
  }),
  'Double Struck': str => str.replace(/[A-Za-z0-9]/g, c => {
    const map = { A:'𝔸',B:'𝔹',C:'ℂ',D:'𝔻',E:'𝔼',F:'𝔽',G:'𝔾',H:'ℍ',I:'𝕀',J:'𝕁',K:'𝕂',L:'𝕃',M:'𝕄',N:'ℕ',O:'𝕆',P:'ℙ',Q:'ℚ',R:'ℝ',S:'𝕊',T:'𝕋',U:'𝕌',V:'𝕍',W:'𝕎',X:'𝕏',Y:'𝕐',Z:'ℤ',a:'𝕒',b:'𝕓',c:'𝕔',d:'𝕕',e:'𝕖',f:'𝕗',g:'𝕘',h:'𝕙',i:'𝕚',j:'𝕛',k:'𝕜',l:'𝕝',m:'𝕞',n:'𝕟',o:'𝕠',p:'𝕡',q:'𝕢',r:'𝕣',s:'𝕤',t:'𝕥',u:'𝕦',v:'𝕧',w:'𝕨',x:'𝕩',y:'𝕪',z:'𝕫',0:'𝟘',1:'𝟙',2:'𝟚',3:'𝟛',4:'𝟜',5:'𝟝',6:'𝟞',7:'𝟟',8:'𝟠',9:'𝟡' };
    return map[c] || c;
  }),
  'Fraktur': str => str.replace(/[A-Za-z]/g, c => {
    const map = { A:'𝔄',B:'𝔅',C:'ℭ',D:'𝔇',E:'𝔈',F:'𝔉',G:'𝔊',H:'ℌ',I:'ℑ',J:'𝔍',K:'𝔎',L:'𝔏',M:'𝔐',N:'𝔑',O:'𝔒',P:'𝔓',Q:'𝔔',R:'ℜ',S:'𝔖',T:'𝔗',U:'𝔘',V:'𝔙',W:'𝔚',X:'𝔛',Y:'𝔜',Z:'ℨ',a:'𝔞',b:'𝔟',c:'𝔠',d:'𝔡',e:'𝔢',f:'𝔣',g:'𝔤',h:'𝔥',i:'𝔦',j:'𝔧',k:'𝔨',l:'𝔩',m:'𝔪',n:'𝔫',o:'𝔬',p:'𝔭',q:'𝔮',r:'𝔯',s:'𝔰',t:'𝔱',u:'𝔲',v:'𝔳',w:'𝔴',x:'𝔵',y:'𝔶',z:'𝔷' };
    return map[c] || c;
  }),
  'Monospace': str => str.replace(/[A-Za-z0-9]/g, c => {
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x1D670 + c.charCodeAt(0) - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x1D68A + c.charCodeAt(0) - 97);
    if (c >= '0' && c <= '9') return String.fromCodePoint(0x1D7F6 + c.charCodeAt(0) - 48);
    return c;
  }),
  'Circled': str => str.replace(/[A-Za-z0-9]/g, c => {
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x24B6 + c.charCodeAt(0) - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x24D0 + c.charCodeAt(0) - 97);
    if (c === '0') return '⓪';
    if (c >= '1' && c <= '9') return String.fromCodePoint(0x2460 + c.charCodeAt(0) - 49);
    return c;
  }),
  'Squared': str => str.replace(/[A-Za-z]/g, c => {
    if (c >= 'A' && c <= 'Z') return String.fromCodePoint(0x1F130 + c.charCodeAt(0) - 65);
    if (c >= 'a' && c <= 'z') return String.fromCodePoint(0x1F130 + c.charCodeAt(0) - 97);
    return c;
  }),
  'Upside Down': str => {
    const map = {a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',h:'ɥ',i:'ᴉ',j:'ɾ',k:'ʞ',l:'l',m:'ɯ',n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z',A:'∀',B:'B',C:'Ɔ',D:'D',E:'Ǝ',F:'Ⅎ',G:'פ',H:'H',I:'I',J:'ɾ',K:'K',L:'˥',M:'W',N:'N',O:'O',P:'Ԁ',Q:'Q',R:'R',S:'S',T:'┴',U:'∩',V:'Λ',W:'M',X:'X',Y:'⅄',Z:'Z','1':'⇂','2':'ᄅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'ㄥ','8':'8','9':'6','0':'0','!':'¡','?':'¿',',':"'",'.':'˙',"'":",",'"':',','(':')',')':'('};
    return str.split('').reverse().map(c => map[c] || c).join('');
  },
  'Small Caps': str => str.replace(/[a-z]/g, c => {
    const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'q',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
    return map[c] || c;
  }),
  'Strikethrough': str => str.split('').map(c => c + '\u0336').join(''),
  'Underline': str => str.split('').map(c => c + '\u0332').join(''),
  'Bubble': str => str.replace(/[A-Za-z0-9 ]/g, c => {
    if (c === ' ') return ' ';
    const map = {A:'🅐',B:'🅑',C:'🅒',D:'🅓',E:'🅔',F:'🅕',G:'🅖',H:'🅗',I:'🅘',J:'🅙',K:'🅚',L:'🅛',M:'🅜',N:'🅝',O:'🅞',P:'🅟',Q:'🅠',R:'🅡',S:'🅢',T:'🅣',U:'🅤',V:'🅥',W:'🅦',X:'🅧',Y:'🅨',Z:'🅩',a:'🅐',b:'🅑',c:'🅒',d:'🅓',e:'🅔',f:'🅕',g:'🅖',h:'🅗',i:'🅘',j:'🅙',k:'🅚',l:'🅛',m:'🅜',n:'🅝',o:'🅞',p:'🅟',q:'🅠',r:'🅡',s:'🅢',t:'🅣',u:'🅤',v:'🅥',w:'🅦',x:'🅧',y:'🅨',z:'🅩'};
    return map[c.toUpperCase()] || c;
  }),
};

export default function TextStylerPage() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState('');

  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const styles = Object.entries(transformers).map(([name, fn]) => ({
    name,
    output: input ? fn(input) : '',
  }));

  return (
    <Layout>
      <Head><title>Meg — Text Styler</title></Head>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p className="tag" style={{ marginBottom: '1rem' }}>Generator</p>
          <h1 className="section-title">Text Styler</h1>
          <p className="section-sub">Ubah teks biasa ke berbagai gaya Unicode. Copy & paste ke mana saja.</p>
        </div>

        {/* Input */}
        <div style={{ marginBottom: '2rem' }}>
          <textarea
            placeholder="Tulis teks di sini..."
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={3}
            style={{ resize: 'vertical', fontSize: '1rem' }}
          />
          {input && (
            <button onClick={() => setInput('')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <i className="fa-solid fa-xmark" /> Clear
            </button>
          )}
        </div>

        {/* Results */}
        {input ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {styles.map(({ name, output }) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.9rem 1rem',
                background: '#111',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--gray-600)', minWidth: '90px', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{name}</span>
                <span style={{ flex: 1, fontSize: '1rem', wordBreak: 'break-word', lineHeight: 1.5 }}>{output}</span>
                <button
                  onClick={() => copy(output, name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                    color: copied === name ? '#50e0a0' : 'var(--gray-400)',
                    flexShrink: 0,
                    transition: 'color 0.15s',
                  }}
                >
                  <i className={`fa-solid ${copied === name ? 'fa-check' : 'fa-copy'}`} />
                  {copied === name ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '6px' }}>
            <i className="fa-solid fa-font" style={{ fontSize: '2rem', color: 'var(--gray-600)', display: 'block', marginBottom: '0.75rem' }} />
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--gray-600)', fontSize: '0.85rem' }}>Mulai ketik untuk melihat preview semua gaya teks</p>
          </div>
        )}
      <ToolStats toolId="text-styler" />
      </div>
    </Layout>
  );
}
