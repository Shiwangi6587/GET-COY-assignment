const names = ['Aanya','Riya','Meera','Kabir','Arjun','Isha','Zoya','Vihaan','Naina','Dev','Tara','Rohan','Anika','Kian','Sana','Ishaan','Diya','Aarav','Myra','Neel','Pooja','Samar','Kavya','Yash','Ira','Reyansh','Sia','Veer','Mahi','Ayaan','Rhea','Ansh'];
const places = ['IIT Delhi','Delhi University','IGDTUW, Delhi','Gurugram','Noida','BITS Pilani','Ashoka University','Jamia Millia Islamia','Faridabad','Ghaziabad','Christ University, Bengaluru','Mumbai','Pune','Hyderabad','Jaipur','Chandigarh'];
const bios = [
  'Chai first, opinions second.','Will trade playlist recs for good momo spots.','Weekend trekker, weekday overthinker.','Looking for someone who laughs at their own jokes too.','Amateur photographer, professional napper.','Can cook one dish really well. Ask me which.','Bookshop wanderer. Currently reading too many things at once.','Gym at 6am, memes at 6pm.','Slow mornings, long walks, loud music.','Debugging code and my life choices.','Stand-up comedy nerd and part-time baker.','Ask me about my plant collection.'
];
const interests = ['Travel','Coding','Music','Coffee','Hiking','Photography','Cooking','Movies','Books','Gaming','Fitness','Art','Dancing','Football','Cricket','Poetry','Anime','Yoga'];

export const PROFILES = names.map((name, i) => ({
  id: `p${i + 1}`,
  name,
  age: 20 + ((i * 7) % 9),
  photo: `https://picsum.photos/seed/coy-${i + 1}/600/800`,
  bio: bios[i % bios.length],
  place: places[(i * 5) % places.length],
  interests: [0, 1, 2].map((k) => interests[(i * 3 + k * 5) % interests.length]),
  // Server-side only. Never sent to the client (see publicProfile in lib/db.js).
  likesYou: i % 3 === 1 || i === 0, // 11 of 32; p1 and p2 are first in the feed for an instant demo
}));
