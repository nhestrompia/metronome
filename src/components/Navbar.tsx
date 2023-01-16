import React, { useState } from "react";
import Link from "next/link";
import {
  faApple,
  faGooglePlay,
  faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="fixed grid   grid-cols-3">
        <div
          className={`
              h-screen font-montserrat transition
             duration-300 ease-in-out`}
        >
          <div className="flex h-full w-16 flex-col-reverse gap-8  bg-[#1E293B] p-3 text-white">
            <div className="space-y-3">
              <div className={` flex-2`}>
                <ul className="space-y-8 pt-2 pb-4 text-sm">
                  <Link href="/">
                    <li className="rounded-md transition-all duration-300 ease-in-out hover:bg-slate-200 hover:text-[#1E293B]">
                      <span className="flex items-center justify-center space-x-2 rounded-md p-2">
                        <FontAwesomeIcon icon={faApple} className="fa-2x" />
                      </span>
                    </li>
                  </Link>
                  <Link href="/">
                    <li className="rounded-md transition-all duration-300 ease-in-out hover:bg-slate-200 hover:text-[#1E293B]">
                      <span className="flex items-center justify-center space-x-2 rounded-md p-2">
                        <FontAwesomeIcon
                          icon={faGooglePlay}
                          className="fa-2x"
                        />
                      </span>
                    </li>
                  </Link>
                  <Link href="/">
                    <li className="rounded-md transition-all duration-300 ease-in-out hover:bg-slate-200 hover:text-[#1E293B]">
                      <span className="flex items-center justify-center space-x-2 rounded-md p-2">
                        <FontAwesomeIcon icon={faGithub} className="fa-2x " />
                      </span>
                    </li>
                  </Link>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
