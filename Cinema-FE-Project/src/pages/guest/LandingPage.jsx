import React from "react";
import styles from "./LandingPage.module.css";

const mockNowShowing = [
  {
    id: 1,
    title: "ĐÊM PREMIERE IMAX",
    age: "T18",
    duration: "120 phút",
    genre: "Hành động",
    badge: "Đặt nhanh",
    rating: "9.2",
  },
  {
    id: 2,
    title: "VŨ TRỤ CINEMA",
    age: "T13",
    duration: "110 phút",
    genre: "Phiêu lưu",
    badge: "Suất sớm",
    rating: "8.7",
  },
  {
    id: 3,
    title: "ĐÊM RẠP PRIVATE",
    age: "T16",
    duration: "95 phút",
    genre: "Tâm lý",
    badge: "Couple",
    rating: "8.9",
  },
  {
    id: 4,
    title: "MIDNIGHT MARATHON",
    age: "T18",
    duration: "180 phút",
    genre: "Marathon",
    badge: "Combo",
    rating: "9.0",
  },
];

const mockComingSoon = [
  {
    id: 1,
    title: "BLADE RUNNER 2099",
    genre: "Khoa học viễn tưởng",
    age: "T16",
    releaseDate: "15/03/2026",
    description: "Phần tiếp theo của thương hiệu Blade Runner.",
  },
  {
    id: 2,
    title: "AVATAR: THE LAST AIRBENDER 2",
    genre: "Phiêu lưu",
    age: "T13",
    releaseDate: "22/03/2026",
    description: "Hành trình mới của Aang và nhóm bạn.",
  },
  {
    id: 3,
    title: "FROZEN III",
    genre: "Hoạt hình",
    age: "P",
    releaseDate: "29/03/2026",
    description: "Câu chuyện tiếp nối vương quốc Arendelle.",
  },
  {
    id: 4,
    title: "MISSION: IMPOSSIBLE 9",
    genre: "Hành động",
    age: "T16",
    releaseDate: "05/04/2026",
    description: "Nhiệm vụ bất khả thi mới từ Ethan Hunt.",
  },
];

const mockPromos = [
  {
    id: 1,
    title: "Giảm 30% vé thứ 2",
    code: "COMBO30",
    discount: "30%",
    description: "Mua 2 vé trở lên, vé thứ 2 giảm 30%. Áp dụng tất cả rạp.",
    validUntil: "31/03/2026",
    type: "combo",
  },
  {
    id: 2,
    title: "Suất sớm chỉ 59K",
    code: "EARLY59",
    discount: "59K",
    description: "Vé suất chiếu trước 12h trưa các ngày trong tuần.",
    validUntil: "30/04/2026",
    type: "early",
  },
  {
    id: 3,
    title: "Combo bắp nước -20%",
    code: "COMBOF&B",
    discount: "20%",
    description: "Giảm 20% khi mua combo bắp nước size L trở lên.",
    validUntil: "15/04/2026",
    type: "combo",
  },
];

function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.navbar}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>CM</div>
            <div>
              <span className={styles.logoTextPrimary}>Cinema</span>{" "}
              <span className={styles.logoTextSecondary}>Ticket</span>
            </div>
          </div>
          <nav className={styles.navLinks}>
            <span className={styles.navLink}>Phim</span>
            <span className={styles.navLink}>Lịch chiếu</span>
            <span className={styles.navLink}>Khuyến mãi</span>
            <span className={styles.navLink}>Liên hệ</span>
          </nav>
          <div className={styles.navActions}>
            <span className={styles.loginText}>Đăng nhập</span>
            <button type="button" className="btn-primary">
              Đăng ký
            </button>
          </div>
        </header>

        <main>
          <section className={styles.hero}>
            <div>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowDot} />
                Đặt vé trong 60 giây
              </div>
              <h1 className={styles.heroTitle}>
                Trải nghiệm{" "}
                <span className={styles.titleAccent}>rạp phim cao cấp</span> ngay
                tại trung tâm thành phố.
              </h1>
              <p className={styles.heroSubtitle}>
                Chọn suất chiếu, ghế VIP, combo bắp nước và thanh toán online
                chỉ với vài thao tác. Vé & QR được gửi ngay sau khi hoàn tất.
              </p>

              <div className={styles.heroMeta}>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  <span>Hơn 50+ suất chiếu mỗi ngày</span>
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  <span>Thanh toán bảo mật với VNPay / Momo</span>
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  <span>Check-in QR trong 2 giây</span>
                </span>
              </div>

              <div className={styles.heroActions}>
                <button type="button" className="btn-primary">
                  Đặt vé ngay
                </button>
                <button type="button" className="btn-outline">
                  Xem lịch chiếu hôm nay
                </button>
              </div>

              <p className={styles.heroNote}>
                Không cần xếp hàng — chọn ghế đẹp & giữ chỗ trước cho cả nhóm.
              </p>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroGlow} />
              <div className={styles.heroCard}>
                <div className={styles.heroCardBackdrop} />
                <div className={styles.heroCardContent}>
                  <div className={styles.ticketStub}>
                    <div className={styles.ticketHeader}>
                      <span className={styles.ticketCinema}>CINEMA PREMIUM</span>
                      <span className={styles.ticketTag}>ONLINE BOOKING</span>
                    </div>
                    <h3 className={styles.ticketTitle}>Suất chiếu tối nay</h3>
                    <div className={styles.ticketMeta}>
                      <span>
                        Phim:{" "}
                        <span className={styles.ticketMetaStrong}>
                          Vũ Trụ Cinema
                        </span>
                      </span>
                      <span>Phòng: Screen 03</span>
                      <span>Ghế: Hàng D, E</span>
                    </div>
                    <div className={styles.ticketDivider} />
                    <div className={styles.ticketBottom}>
                      <div className={styles.ticketSeat}>
                        <span className={styles.ticketLabel}>Giờ chiếu</span>
                        <span className={styles.ticketValue}>19:30 · Hôm nay</span>
                      </div>
                      <div className={styles.ticketPrice}>
                        <span className={styles.ticketLabel}>Tổng thanh toán</span>
                        <div className={styles.ticketPriceValue}>320.000đ</div>
                        <span className={styles.ticketPriceHint}>
                          Đã bao gồm combo bắp nước
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.qrPlaceholder}>
                    <div className={styles.qrBox}>
                      <div className={styles.qrPattern} />
                    </div>
                    <p className={styles.qrText}>
                      Quét QR tại quầy check-in để vào rạp trong vài giây.
                    </p>
                    <p className={styles.qrHint}>
                      Không cần in vé · Không lo trễ suất · Cập nhật theo thời
                      gian thực.
                    </p>
                  </div>
                </div>
                <div className={styles.statsStrip}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Thời gian đặt vé</span>
                    <span className={`${styles.statValue} ${styles.statHighlight}`}>
                      &lt; 60 giây
                    </span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Đánh giá khách hàng</span>
                    <span className={styles.statValue}>4.9 / 5.0</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Suất chiếu hôm nay</span>
                    <span className={styles.statValue}>50+ suất</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Phim đang chiếu</h2>
              <p className={styles.sectionSubtitle}>
                Chọn nhanh suất chiếu hot, ghế đẹp tại các rạp trong hệ thống.
              </p>
            </div>
            <div className={styles.movieGrid}>
              {mockNowShowing.map((movie) => (
                <article key={movie.id} className={styles.movieCard}>
                  <div className={styles.moviePoster}>
                    <span className={styles.movieBadge}>{movie.badge}</span>
                    <span className={styles.movieRating}>★ {movie.rating}</span>
                  </div>
                  <div className={styles.movieBody}>
                    <h3 className={styles.movieTitle}>{movie.title}</h3>
                    <div className={styles.movieMeta}>
                      <span>{movie.duration}</span>
                      <span className={styles.pill}>{movie.genre}</span>
                      <span className={styles.pill}>{movie.age}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Phim sắp chiếu</h2>
              <p className={styles.sectionSubtitle}>
                Cập nhật lịch ra rạp và đặt vé sớm nhận ưu đãi.
              </p>
            </div>
            <div className={styles.comingSoonGrid}>
              {mockComingSoon.map((movie) => (
                <article key={movie.id} className={styles.comingSoonCard}>
                  <div className={styles.comingSoonPoster}>
                    <span className={styles.comingSoonBadge}>Sắp chiếu</span>
                    <span className={styles.comingSoonDate}>
                      {movie.releaseDate}
                    </span>
                  </div>
                  <div className={styles.comingSoonBody}>
                    <h3 className={styles.comingSoonTitle}>{movie.title}</h3>
                    <p className={styles.comingSoonDesc}>{movie.description}</p>
                    <div className={styles.comingSoonMeta}>
                      <span className={styles.pill}>{movie.genre}</span>
                      <span className={styles.pill}>{movie.age}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Khuyến mãi & Giảm giá</h2>
              <p className={styles.sectionSubtitle}>
                Mã giảm giá và ưu đãi đặc biệt khi đặt vé online.
              </p>
            </div>
            <div className={styles.promoGrid}>
              {mockPromos.map((promo) => (
                <article key={promo.id} className={styles.promoCard}>
                  <div className={styles.promoHead}>
                    <span className={styles.promoDiscount}>{promo.discount}</span>
                    <span className={styles.promoCode}>{promo.code}</span>
                  </div>
                  <h3 className={styles.promoTitle}>{promo.title}</h3>
                  <p className={styles.promoDesc}>{promo.description}</p>
                  <div className={styles.promoFooter}>
                    <span className={styles.promoValid}>HSD: {promo.validUntil}</span>
                    <button type="button" className={styles.promoCopy}>
                      Sao chép mã
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Đặt vé chỉ với 3 bước</h2>
              <p className={styles.sectionSubtitle}>
                Quy trình được tối ưu cho khách hàng đặt vé trên mọi thiết bị.
              </p>
            </div>
            <div className={styles.steps}>
              <article className={styles.stepCard}>
                <div className={styles.stepIndex}>01</div>
                <h3 className={styles.stepTitle}>Chọn phim & suất chiếu</h3>
                <p className={styles.stepText}>
                  Lọc theo rạp, khung giờ, thể loại. Gợi ý suất chiếu hot & ghế
                  trung tâm màn hình.
                </p>
              </article>
              <article className={styles.stepCard}>
                <div className={styles.stepIndex}>02</div>
                <h3 className={styles.stepTitle}>Chọn ghế & combo</h3>
                <p className={styles.stepText}>
                  Sơ đồ ghế trực quan, hỗ trợ đặt nhiều ghế cho nhóm cùng lúc. Tự
                  động gợi ý combo bắp nước.
                </p>
              </article>
              <article className={styles.stepCard}>
                <div className={styles.stepIndex}>03</div>
                <h3 className={styles.stepTitle}>Thanh toán & check-in</h3>
                <p className={styles.stepText}>
                  Thanh toán online, nhận QR code ngay lập tức. Chỉ cần đưa QR để
                  vào rạp, không cần in vé giấy.
                </p>
              </article>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <span>© {new Date().getFullYear()} Cinema Management System.</span>
          <div className={styles.footerLinks}>
            <span>Điều khoản sử dụng</span>
            <span>Chính sách bảo mật</span>
            <span>Hỗ trợ khách hàng</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;

