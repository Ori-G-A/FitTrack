// Se prepara antes de inyectar App: Date queda fijo mientras se pausa y después
// vuelve a avanzar junto con los temporizadores mediante runFor.
export async function preparePausedClock(page,time){
 await page.clock.install({time});
 await page.clock.setFixedTime(time);
 await page.clock.pauseAt(time);
 await page.clock.setSystemTime(time);
}
