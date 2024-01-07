const fs = require('fs');
const p = require('path');
const config = require('../tsconfig.json');
const paths = config.compilerOptions.paths;
const out = config.compilerOptions.outDir;

for(let p in paths)
{
    paths[p] = `${paths[p]}`.replace('./','').replace('*', '');    
}

function findBaseUrl(file)
{
    return `${file}`.split('\\').length - 1;  
}

const files = fs.readdirSync(p.join(process.cwd(), out), {recursive : true}).filter(s => s.endsWith('.js'));

for(let f of files)
{
    let q = findBaseUrl(f);
    let b = '';
    for(let i = 0; i < q; i++)
        b += '../';

    let u = fs.readFileSync(p.join(process.cwd(), out, f), 'utf8');
    
    for(let k in paths)
    {
        let v = k.replace('*', '');
        do
        {
            u = u.replace(v, `${b}${paths[k]}`.replace('\\', '/'), true);  

        }
        while(u.indexOf(v) > -1);
       
    }   

    fs.writeFileSync(p.join(process.cwd(), out, f), u, 'utf8');
    
}