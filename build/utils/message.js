import kleur from 'kleur'

export default function message(text, type, timerID) {
    switch (type) {
        case 'success':
            console.log('✅ ', kleur.bgGreen().black(text))
            break

        case 'chore':
            console.log('🧹 ', kleur.bgGreen().black(text))
            break

        case 'notice':
            console.log('ℹ️  ', kleur.bgBlue().black(text))
            break

        case 'error':
            console.log('❌ ', kleur.bgRed().black(text))
            break

        case 'warning':
            console.log('⚠️  ', kleur.bgYellow().black(text))
            break

        case 'welcome':
            console.clear()
            console.log(` ${kleur.bold().magenta('┌──────────────────────────────────┐')}`)
            console.log(` ${kleur.bold().magenta('│                                  │')}`)
            console.log(` ${kleur.bold().magenta('│')}    ${kleur.bold().magenta('B( * )( * )B')} ${kleur.bold().white('@ v1.0')}           ${kleur.bold().magenta('│')}`)
            console.log(` ${kleur.bold().magenta('│                                  │')}`)
            console.log(` ${kleur.bold().magenta('│')}    ${kleur.bold().cyan('► Environment:')} development    ${kleur.bold().magenta('│')}`)
            console.log(` ${kleur.bold().magenta('│')}    ${kleur.bold().cyan('► Target:')}      static         ${kleur.bold().magenta('│')}`)
            console.log(` ${kleur.bold().magenta('│                                  │')}`)
            console.log(` ${kleur.bold().magenta('│')}    ${kleur.bold().white('Listening:')}                    ${kleur.bold().magenta('│')}`)
            console.log(` ${kleur.bold().magenta('│')}    ${kleur.bold().underline().blue('http://localhost:8008')}         ${kleur.bold().magenta('│')}`)
            console.log(` ${kleur.bold().magenta('│                                  │')}`)
            console.log(` ${kleur.bold().magenta('└──────────────────────────────────┘')}`)
            break

        case 'waiting':
            console.log('⏱ ', kleur.blue().italic(text))
    
        

            if (timerID != null) {
                console.timeLog(timerID)
                timerID = null
            }
            break

        default:
            console.log(text)
            break;
    }

    if (timerID != null) {
        console.timeEnd(timerID)
    }

    console.log('')
};
