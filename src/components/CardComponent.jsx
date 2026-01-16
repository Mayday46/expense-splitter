
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

const CardComponent = ( {header, contentMetric, contentSubtitle, icon} ) => {
    return (
        <Card>
            <CardHeader className = "flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className = "text-sm font-medium"> {header} </CardTitle>
                {icon}
            </CardHeader>

            <CardContent className = "flex flex-col items-start">
                <div className = "text-2xl font-bold"> {contentMetric} </div>
                {/* <CardDescription className = "text-xs text-muted-foreground"> {contentSubtitle} </CardDescription> */}
                <p className = "text-xs text-muted-foreground"> {contentSubtitle} </p>
            </CardContent>
        </Card>
    )
}

export default CardComponent;