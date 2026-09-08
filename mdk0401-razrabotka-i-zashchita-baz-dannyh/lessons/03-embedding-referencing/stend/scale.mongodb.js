// Занятие 2 · большая база: те же две формы, но 20 000 резюме и 5 000 компаний
//
//   docker exec -i hh-mongo mongosh hh --quiet --file /dev/stdin < scale.mongodb.js
//
// Скрипт собирает коллекции big_embed, big_ref и big_companies (около 20 МБ),
// повторяет три замера занятия на масштабе и оставляет коллекции в базе:
// на них удобно смотреть в Compass — там видно средний размер документа.
// Удалить: db.big_embed.drop(); db.big_ref.drop(); db.big_companies.drop()

const NC = 5000, NR = 20000;
db.big_companies.drop(); db.big_embed.drop(); db.big_ref.drop();

const cs = [];
for (let i = 0; i < NC; i++) cs.push({ _id: "c" + i, name: "Компания " + i, site: "c" + i + ".ru",
  industry: ["ИТ", "телеком", "ритейл", "медицина"][i % 4], city: ["Москва", "Ярославль", "Казань"][i % 3], employees: 50 + i });
db.big_companies.insertMany(cs);

const pick = i => cs[(i * 7919) % NC];
const embed = [], ref = [];
for (let i = 0; i < NR; i++) {
  const jobs = [0, 1, 2].map(k => pick(i + k * 13));
  const base = { _id: "r" + i, fio: "Соискатель " + i, city: ["Москва", "Ярославль", "Казань"][i % 3], salary: 60000 + (i % 10) * 10000 };
  embed.push({ ...base, experience: jobs.map((c, k) => ({ role: "разработчик", months: 6 + k * 7,
    company: { name: c.name, site: c.site, industry: c.industry, city: c.city } })) });
  ref.push({ ...base, experience: jobs.map((c, k) => ({ role: "разработчик", months: 6 + k * 7, company_id: c._id })) });
}
db.big_embed.insertMany(embed); db.big_ref.insertMany(ref);
print(`собрано: ${db.big_embed.countDocuments()} + ${db.big_ref.countDocuments()} резюме, ${db.big_companies.countDocuments()} компаний`);
print(`объём: вложение ${db.big_embed.stats().size} байт | ссылка ${db.big_ref.stats().size} + ${db.big_companies.stats().size} байт`);

const ms = f => { const t = Date.now(); f(); return Date.now() - t; };
print("\n500 карточек:");
print("  вложение, один запрос      ", ms(() => db.big_embed.find({ city: "Ярославль" }).limit(500).toArray()), "мс");
print("  ссылка, $lookup по _id     ", ms(() => db.big_ref.aggregate([{ $match: { city: "Ярославль" } }, { $limit: 500 },
  { $lookup: { from: "big_companies", localField: "experience.company_id", foreignField: "_id", as: "c" } }]).toArray()), "мс");
print("  ссылка, $lookup по site    ", ms(() => db.big_ref.aggregate([{ $match: { city: "Ярославль" } }, { $limit: 500 },
  { $lookup: { from: "big_companies", localField: "experience.company_id", foreignField: "site", as: "c" } }]).toArray()), "мс  ← индекса на site нет");

print("\nотчёт по отрасли «медицина»:");
print("  вложение", ms(() => db.big_embed.countDocuments({ "experience.company.industry": "медицина" })), "мс");
print("  ссылка  ", ms(() => { const ids = db.big_companies.find({ industry: "медицина" }, { _id: 1 }).toArray().map(d => d._id);
  db.big_ref.countDocuments({ "experience.company_id": { $in: ids } }); }), "мс");

print("\nпереименование одной компании:");
print("  вложение · updateMany изменил", db.big_embed.updateMany({ "experience.company.name": "Компания 42" },
  { $set: { "experience.$[x].company.name": "Компания 42 (новое имя)" } }, { arrayFilters: [ { "x.company.name": "Компания 42" } ] }).modifiedCount, "документов");
print("  ссылка   · updateOne изменил ", db.big_companies.updateOne({ _id: "c42" }, { $set: { name: "Компания 42 (новое имя)" } }).modifiedCount, "документ");
