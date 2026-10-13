// Разделы ТЗ для страниц сайта: печатает JSON, его читает ../build.py.
import { parts } from './lib/render.mjs';
import { load } from './lib/load.mjs';
import { COMPANY, PEOPLE } from './data/company.mjs';

const out = {};
for (const { tz, req } of await load()) {
  const p = parts(tz, req, { site: true });
  const person = PEOPLE[tz.contact.key];
  out[tz.slug] = {
    code: tz.code, title: tz.title, subtitle: tz.subtitle, accent: tz.accent, pdf: `pdf/${tz.file}.pdf`,
    meta: [['Заказчик', `${COMPANY.short}, ИТ-отдел`], ['Руководитель работ', `${person[0]}, ${person[1]}`], ['Наставник', COMPANY.mentor.name],
      ['Сервер', tz.server], ['Вид работ', tz.workType], ['Исполнители', 'пара практикантов'], ['Срок', '14 календарных дней']],
    sections: [p.letter, p.s1, p.s2, p.s3, p.s4], appendix: [p.appA, p.appB],
  };
}
process.stdout.write(JSON.stringify(out));
