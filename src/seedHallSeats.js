// // seedDatabase.js
// const { connectMongo } = require("./mongo");
// const Genre = require("./modules/genre/models/Genre");
// const Movie = require("./modules/movie/models/Movie");
// const Hall = require("./modules/hall/models/Hall");
// const { Seat, SeatType } = require("./modules/seat/models/Seat");
// const Showtime = require("./modules/showtime/models/Showtime");
// const PricingRule = require("./modules/pricing_rule/models/PricingRule");

// async function seedDatabase() {
//   await connectMongo();

//   // --------------------------
//   // 1️⃣ Genres
//   // --------------------------
//   const genresData = [
//     { name: "Action", description: "Phim hành động" },
//     { name: "Comedy", description: "Phim hài hước" },
//     { name: "Horror", description: "Phim kinh dị" }
//   ];

//   // Xóa cũ nếu có
//   await Genre.deleteMany({});
//   const genres = await Genre.insertMany(genresData);
//   console.log("✅ Genres created");

//   // --------------------------
//   // 2️⃣ Movies
//   // --------------------------
//   const moviesData = [
//     {
//       title: "Fast & Furious 10",
//       description: "Phim hành động siêu kịch tính",
//       duration: 130,
//       releaseDate: new Date("2026-05-01"),
//       genres: [genres[0]._id] // Action
//     },
//     {
//       title: "Funny Movie",
//       description: "Phim hài hước vui nhộn",
//       duration: 100,
//       releaseDate: new Date("2026-06-01"),
//       genres: [genres[1]._id] // Comedy
//     },
//   ];

//   await Movie.deleteMany({});
//   const movies = await Movie.insertMany(moviesData);
//   console.log("✅ Movies created");

//   // --------------------------
//   // 3️⃣ Halls + Seats
//   // --------------------------
//   const hall = new Hall({
//     name: "Hall 1",
//     capacity: 20,
//     type: "Standard"
//   });
//   await hall.save();

//   // Xóa seat cũ
//   await Seat.deleteMany({ hall: hall._id });

//   const seats = [];
//   const rows = 4;
//   const cols = 5;
//   for (let r = 1; r <= rows; r++) {
//     for (let c = 1; c <= cols; c++) {
//       const seatNumber = `${r}${String.fromCharCode(64 + c)}`; // 1A, 1B...
//       seats.push(new Seat({
//         seatNumber,
//         row: r,
//         col: c,
//         hall: hall._id,
//         type: SeatType.NORMAL
//       }));
//     }
//   }
//   const savedSeats = await Seat.insertMany(seats);
//   hall.seats = savedSeats.map(s => s._id);
//   await hall.save();
//   console.log("✅ Hall and Seats created");

//   // --------------------------
//   // 4️⃣ Showtimes
//   // --------------------------
//   await Showtime.deleteMany({});
//   const showtimesData = [
//     {
//       startTime: new Date("2026-05-01T10:00:00Z"),
//       endTime: new Date("2026-05-01T12:10:00Z"),
//       hall: hall._id,
//       movie: movies[0]._id
//     },
//     {
//       startTime: new Date("2026-05-01T14:00:00Z"),
//       endTime: new Date("2026-05-01T16:10:00Z"),
//       hall: hall._id,
//       movie: movies[0]._id
//     },
//   ];
//   const showtimes = await Showtime.insertMany(showtimesData);
//   console.log("✅ Showtimes created");

//   // --------------------------
//   // 5️⃣ PricingRules
//   // --------------------------
//   await PricingRule.deleteMany({});
//   const pricingRulesData = showtimes.flatMap(st => [
//     {
//       showtime: st._id,
//       seatType: SeatType.NORMAL,
//       price: 80000
//     },
//     {
//       showtime: st._id,
//       seatType: SeatType.VIP,
//       price: 120000
//     }
//   ]);

//   await PricingRule.insertMany(pricingRulesData);
//   console.log("✅ PricingRules created");

//   console.log("🎉 Database seeding completed!");
//   process.exit(0);
// }

// seedDatabase().catch(err => {
//   console.error(err);
//   process.exit(1);
// });