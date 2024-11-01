import { Box } from "@mantine/core";
import { HeaderMegaMenu } from "./HeaderMegaMenu";
import { useViewportSize } from "@mantine/hooks";

function Home() {
    const { height, width } = useViewportSize();
    return (
        <Box>
            <HeaderMegaMenu page='Home'/>
        </Box>
    )
}

export default Home