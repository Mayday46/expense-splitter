
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const Header = () => {

    const { theme, toggleTheme } = useTheme();

    return (
        // <div className = "space-y-2">
        //     <h1 className = "text-4xl font-bold tracking-tight"> Expense Splitter </h1>
        //     <p className = "text-muted-foreground"> Snap, tag, and split bills instantly with automated receipt scanning </p>
        // </div>

        // <div className = "flex items-center justify-between">
        //     <div className = "space-y-2">
        //         <h1 className = "text-4xl font-bold tracking-tight"> Expense Splitter </h1>
        //         <p className = "text-muted-foreground"> Snap, tag, and split bills instantly with automated receipt scanning </p>
        //     </div>

        //     <button
        //         onClick = {toggleTheme}
        //         className = "p-2 rounded-md border border-gray-300 hover:bg-accent transition-colors"
        //         aria-label = "Toggle theme"
        //     >

        //         { theme === "light" ? (
        //             <MoonIcon className = "h-5 w-5"/>
        //         ) : (
        //             <SunIcon className = "h-5 w-5"/>
        //         )}

        //     </button>

        // </div>

        <div className = "space-y-2 text-center">
            <div className = "flex items-center justify-center gap-1">

                <h1 className = "text-2xl md:text-4xl font-bold tracking-tight"> Expense Splitter </h1>
                <button onClick = {toggleTheme} className = "p-1.5 hover:bg-accent rounded-md mt-2 md:mt-3">
                    { theme === "light" ? <MoonIcon className = "h-5 w-5"/> : <SunIcon className = "h-5 w-5"/> }
                </button>

            </div>
            <p className = "text-sm md:text-base text-muted-foreground hidden sm:block"> Snap, tag, and split bills instantly with automated receipt scanning... </p>
        </div>

    )
}

export default Header;