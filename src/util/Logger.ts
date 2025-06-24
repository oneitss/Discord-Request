import moment from "moment-timezone";
import chalk from "chalk";

export class Logger {
    clear() {
        console.clear()
    }

    log(text: any) {
        console.log(this.format() + chalk.blue('[INFO] ') + text)
    }

    success(text: any, type: string = 'SUCCESS') {
        console.log(this.format() + chalk.green(`[${type}] `) + text)
    }
    
    warn(text: any) {
        console.log(this.format() + chalk.yellow('[WARN] ') + text)
    }

    error(err: Error | string, type: string = 'ERROR') {
        if(typeof err === 'string') {
            return console.log(this.format() + chalk.red(`[${type}] `) + err)
        } else {
            return console.log(this.format() + chalk.red(`[${type}] `) + `${err.name}: ${err.message}${err?.stack ? `\n${err.stack}` : ''}`)
        }
    }

    private format() {
        const time = moment(Date.now()).tz('Europe/Moscow').locale('ru-RU')
        return chalk.cyan(`[${time.format('DD.MM.YYYY')} | ${time.format('HH:mm:ss')}] `)
    }
}