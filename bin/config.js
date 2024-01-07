const fs = require('fs');
const p = require('path');
const samples = require('../sample.config.json');
const config = require('../tsconfig.json');
const out = config.compilerOptions.outDir;

const style = {
    reset: "\x1b[0m",
    strong: "\x1b[1m",
    ss: "\x1b[4m"    
  };
  

  const text = {   
    red: "\x1b[31m",
    green: "\x1b[32m",   
    white: "\x1b[37m",
    blue: "\x1b[34m"
  };
  
const terminal = require('readline').createInterface(
    {
        input : process.stdin,
        output : process.stdout
    });

function ask(question)
{
    return new Promise((resolve) => 
    {
        terminal.question(question, a => 
            {                
                resolve(a);
            })
    });
}


(async ()=>
{
    let force = process.argv.length > 2 && process.argv[2] == '--force';
    
    if(!force)
    {
        if(fs.existsSync(p.join(process.cwd(), out, 'src', 'config.json')))
        {           
            terminal.close();
            return;
        }
    }

    console.log(style.reset+"config.json");

    for(let k in samples.EnviromentVariables)
    {
        let v = await ask(style.reset+style.strong+`${k} [${samples.EnviromentVariables[k]}]: `+text.green);
        samples.EnviromentVariables[k] = v.length > 0 ? v.trim() : samples.EnviromentVariables[k];
    }
    
    console.log(style.reset);
    console.log('\r\n\r\n');
    console.log(samples);
    console.log('\r\n\r\n');

    let y = await ask(style.reset+'Continue ?' +style.strong+text.blue+'[y/n] :  '+style.reset);
    terminal.close();
    if(y == 'y' || y == 'Y'){
        fs.writeFileSync(p.join(process.cwd(), out, 'src', 'config.json'), JSON.stringify(samples, null, 2), 'utf-8');
        console.log(style.strong+text.green+'File created'+style.reset);
    }
    else
        console.log(style.strong+text.red+'Operation aborted'+style.reset);

})();



