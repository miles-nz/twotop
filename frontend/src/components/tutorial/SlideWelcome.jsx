import Logo from "../ui/Logo";
import { tutorial } from "../../resources";

export default function SlideWelcome() {
    return (
        <div className="flex flex-col items-center justify-center gap-6 w-full h-full py-6">
            <div className="block sm:hidden">
                <Logo size={70} fontSize="4xl" colonOverlap={true} />
            </div>
            <div className="hidden sm:block">
                <Logo size={100} fontSize="7xl" colonOverlap={true} />
            </div>
            <div>
                <p className="text-sm text-text-light text-center leading-relaxed max-w-xs pt-5">
                    {tutorial.welcomeMessage[0]}
                </p>
            </div>
            <div>
                <p className="text-sm text-text-light text-center leading-relaxed max-w-xs mx-15">
                    {tutorial.welcomeMessage[1]}
                </p>
            </div>
        </div>
    );
}
