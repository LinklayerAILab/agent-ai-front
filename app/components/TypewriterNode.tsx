import Image, { StaticImageData } from "next/image";
import Typewriter from "typewriter-effect";
import { useEffect, useRef, useState } from "react";

interface TypewriterInstance {
  typeString: (string: string) => TypewriterInstance;
  pauseFor: (ms: number) => TypewriterInstance;
  deleteAll: (speed?: number) => TypewriterInstance;
  callFunction: (callback: () => void) => TypewriterInstance;
  start: () => TypewriterInstance;
  stop: () => TypewriterInstance;
}

function TypewriterNode(props: { text: string; icon: StaticImageData }) {
  const typewriterRef = useRef<TypewriterInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      if (typewriterRef.current) {
        try {
          typewriterRef.current.stop();
          typewriterRef.current = null;
        } catch (error) {
          // Ignore cleanup errors
          console.log(error);
        }
      }
    };
  }, []);

  return (
    <div
      className="w-[100%] h-[60vh] lg:h-[73.4vh] flex items-center justify-center overflow-hidden"
      ref={containerRef}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#ccc #f1f5f9", // Firefox: thumb color, track color (slate-300, slate-100)
      }}
    >
      <div className="flex items-center justify-center relative w-[100%] h-[100%] bg-[#F9FFE2]">
        <Image
          src={props.icon}
          alt=""
          className="h-[62vh] w-[100%] m-auto object-contain"
        />
        <div className="absolute left-[50%] lg:bottom-[24vh] xl:bottom-[28vh] lg:ml-[-20vh] lg:w-[40vh]">
          <Typewriter
            key={key}
            onInit={(typewriter: TypewriterInstance) => {
              typewriterRef.current = typewriter;

              typewriter
                .typeString(props.text)
                .pauseFor(2000)
                .deleteAll(1) // Delete all content at very fast speed
                .pauseFor(500)
                .callFunction(() => {
                  // Start the next round
                  setTimeout(() => {
                    setKey((prev) => prev + 1); // Force component re-render
                  }, 100);
                });
              typewriter.start();
            }}
            options={{
              autoStart: false,
              loop: false,
              delay: 50,
              wrapperClassName:
                "text-[1.6vh] font-bold text-gray-600 text-left w-full leading-relaxed",
            }}
          />
        </div>
      </div>
    </div>
  );
}
export default TypewriterNode;
