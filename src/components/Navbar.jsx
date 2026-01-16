
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { BanknoteArrowUp, Camera, FileText } from "lucide-react";

const NavBar = ( { activeTab, setActiveTab, expensesCount} ) => {
    return (
        <motion.div
            initial = {{ y: -20, opacity: 0 }}
            animate = {{ y: 0, opacity: 1 }}
            transition = {{ duration: 0.3 }}
            className="w-full"
        >
            <Tabs value = {activeTab} onValueChange = {setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">

                    <TabsTrigger value="upload" className="flex-col gap-1 md:flex-row md:gap-2">
                        <Camera className="h-5 w-5 md:h-4 md:w-4"/>
                        <span className="text-xs md:text-sm">Upload</span>
                    </TabsTrigger>

                    <TabsTrigger value="manual" className="flex-col gap-1 md:flex-row md:gap-2">
                        <FileText className="h-5 w-5 md:h-4 md:w-4"/>
                        <span className="text-xs md:text-sm">Manual</span>
                    </TabsTrigger>

                    <TabsTrigger value="expenses" className="flex-col gap-1 md:flex-row md:gap-2">
                        <BanknoteArrowUp className="h-5 w-5 md:h-4 md:w-4"/>
                        <span className="text-xs md:text-sm">Recent</span>
                    </TabsTrigger>

                </TabsList>
            </Tabs>
        </motion.div>
    );
}



export default NavBar;