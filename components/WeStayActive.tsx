"use client";
import Image from "next/image";

const ACTIVE_ITEMS = [
  {
    id: 1, imageLeft: true,
    image: "/images/activity/fellowship.jpg",
    title: "Fellowship Groups",
    desc: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory.",
  },
  {
    id: 2, imageLeft: false,
    image: "/images/activity/retreat.jpg",
    title: "Church Retreat",
    desc: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory.",
  },
  {
    id: 3, imageLeft: true,
    image: "/images/activity/evangelical.jpg",
    title: "Evangelical Sunday",
    desc: "Your paragraph lorem ipsum the warmth and charm of a cosy, sunlit afternoon spent in a quaint countryside cottage. The soft crackle of a fireplace and the aroma of freshly brewed tea envelope the senses, creating an atmosphere of pure contentment. Outside, a gentle breeze rustles through the leaves, carrying the sweet scent of blooming flowers. Inside, the ambience is enhanced by the gentle glow of candlelight, casting playful shadows on the walls. It's a place where time slows down and every moment is savoured like a cherished memory.",
  },
];

function ExpandableText({ text }: { text: string }) {
  return (
    <div>
      <p
        className="font-lato text-[13px] leading-[1.85] mb-4 sm:mb-5"
        style={{ color: "#8A7078" }}
      >
        {text}
      </p>
    </div>
  );
}

export default function WeStayActive() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-10 bg-white"
      style={{ borderTop: "1px solid rgba(140,58,99,0.08)" }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-8 h-[2px] rounded-full" style={{ backgroundColor: "var(--burgundy)" }} />
          <h2 className="font-playfair text-[22px] sm:text-[26px] font-bold" style={{ color: "var(--text-dark)" }}>
            We Stay Active
          </h2>
        </div>

        <div className="flex flex-col gap-12 sm:gap-14">
          {ACTIVE_ITEMS.map((item) => (
            <div key={item.id}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 items-start">
              {/* Image */}
              <div className={`${item.imageLeft ? "sm:order-1" : "sm:order-2"} order-1`}>
                <Image
                  src={item.image}
                  alt={item.title}
                  width={800}
                  height={500}
                  className="w-full h-[320px] object-cover rounded-sm"
                />
              </div>

              {/* Text */}
              <div className={`${item.imageLeft ? "sm:order-2" : "sm:order-1"} order-2`}>
                <div className="w-6 h-[2px] rounded-full mb-4" style={{ backgroundColor: "var(--burgundy)" }} />
                <h3 className="font-playfair text-[18px] sm:text-[20px] font-semibold mb-3 sm:mb-4"
                  style={{ color: "var(--text-dark)" }}>
                  {item.title}
                </h3>
                <ExpandableText text={item.desc} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
