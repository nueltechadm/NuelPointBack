const fs = require('fs');
const p = require('path');
const config = require('../tsconfig.json');
const paths = config.compilerOptions.paths;
const out = config.compilerOptions.outDir;

for(let p in paths)
{
    paths[p] = `${paths[p]}`.replace('./','').replace('*', '');    
}


let force = process.argv.length > 2 && process.argv[2] == '--force';
    
if(force && fs.existsSync(p.join(process.cwd(), out)))
{
   fs.unlinkSync(p.join(process.cwd(), out));
}

function findBaseUrl(file)
{
    let parts = `${file}`.split('\\');  
    
    let p = parts.filter(s => s.indexOf(out.replace('./','')) > -1);

    return parts.length - parts.indexOf(p[0]) - 2;
}

function getFiles (folder)
{
    let r = [];

    let t = fs.readdirSync(folder).map(s => p.join(folder, s));

    let f = t.filter(s => s.lastIndexOf('.') >= s.length - 5);

    r.push(...f);
    
    let d = t.filter(s => !f.includes(s));

    d.forEach(s => r.push(...getFiles(s)));

    return r;
    
}

const files = getFiles(p.join(process.cwd(), out)).filter(s => s.endsWith('.js'));

for(let f of files)
{
    let q = findBaseUrl(f);
    let b = '';
    for(let i = 0; i < q; i++)
        b += '../';

    let u = fs.readFileSync(f, 'utf8');
    
    for(let k in paths)
    {
        let v = k.replace('*', '');
        do
        {
            u = u.replace(v, `${b}${paths[k]}`.replace('\\', '/'), true);  

        }
        while(u.indexOf(v) > -1);
       
    }   

    fs.writeFileSync(f, u, 'utf8');
    
}