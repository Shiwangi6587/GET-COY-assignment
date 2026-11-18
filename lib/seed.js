const names = ['Aanya','Riya','Meera','Kabir','Arjun','Isha','Zoya','Vihaan','Naina','Dev','Tara','Rohan','Anika','Kian','Sana','Ishaan','Diya','Aarav','Myra','Neel','Pooja','Samar','Kavya','Yash','Ira','Reyansh','Sia','Veer','Mahi','Ayaan','Rhea','Ansh'];
const colleges = ['IIT Delhi','Delhi University','Jamia Millia Islamia','BITS Pilani','Ashoka University'];
const bios = [
  'Chai first, opinions second.','Will trade playlist recs for good momo spots.','Weekend trekker, weekday overthinker.','Looking for someone who laughs at their own jokes too.','Amateur photographer, professional napper.','Can cook one dish really well. Ask me which.','Bookshop wanderer. Currently reading too many things at once.','Gym at 6am, memes at 6pm.','Slow mornings, long walks, loud music.','Debugging code and my life choices.','Stand-up comedy nerd and part-time baker.','Ask me about my plant collection.'
];
const interests = ['Travel','Coding','Music','Coffee','Hiking','Photography','Cooking','Movies','Books','Gaming','Fitness','Art','Dancing','Football','Cricket','Poetry','Anime','Yoga'];
const adj = ['Quiet','Midnight','Velvet','Golden','Secret','Gentle','Wandering','Electric'];
const noun = ['Cartographer','Poet','Lantern','Fox','Pianist','Comet','Gardener','Sparrow'];

export const PROFILES = names.map((name, i) => ({
  id: `p${i + 1}`,
  name,
  age: 20 + ((i * 7) % 9),
  photo: `https://picsum.photos/seed/coy-${i + 1}/600/800`,
  bio: bios[i % bios.length],
  place: i % 3 === 0 ? 'IGDTUW, Delhi' : colleges[i % colleges.length],
  interests: [0, 1, 2].map((k) => interests[(i * 3 + k * 5) % interests.length]),
  // The fields below are server-side only and are never sent to the client.
  anonymous: i % 4 === 1,            // shows a codename and no photo until both sides reveal
  codename: `${adj[i % 8]} ${noun[Math.floor(i / 4) % 8]}`,
  willReveal: i % 8 !== 5,           // simulated: whether they reveal back when you do
  likesYou: i % 3 === 1 || i === 0,  // 11 of 32; p1 and p2 come first in the feed
}));
