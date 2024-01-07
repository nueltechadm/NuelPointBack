const fs = require('fs');
const p = require('path');
const config = require('./tsconfig.json');
const path = require('path');
const paths = config.compilerOptions.paths;
const out = config.compilerOptions.outDir;
for(let p in paths)
{
    paths[p] = `${paths[p]}`.replace('./','').replace('*', '');
    console.log(p);
}

function FindBaseUrl(file)
{
     return `${file}`.split('\\').length - 1;  
}

const files = fs.readdirSync(p.join(__dirname, out), {recursive : true}).filter(s => s.endsWith('.js'));


for(let f of files)
{
    let b = '';
    for(let i = 0; i < FindBaseUrl(f); i++)
        b += '../';

    let u = fs.readFileSync(p.join(__dirname, out, f), 'utf8');
    
    for(let k in paths)
    {
        u = u.replace(k, `${b}${paths[k]}`.replace('\\', '/'));
        fs.writeFileSync(p.join(__dirname, out, f), u, 'utf8');
    }

    break;
}