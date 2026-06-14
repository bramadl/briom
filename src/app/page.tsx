import { Logo } from "@briom/components/logo";
import { Button } from "@briom/components/ui/button";
import { Container } from "@briom/components/ui/container";
import { Fragment } from "react/jsx-runtime";

function Navigation() {
	return (
		<nav className="sticky top-0 inset-x-0 backdrop-blur-xs border-b">
			<Container>
				<div className="flex items-center justify-between min-h-24">
					<Logo tagline tinted />
					<Button>Get Started</Button>
				</div>
			</Container>
		</nav>
	);
}

function HeroSection() {
	return (
		<Container as="section">
			<div className="min-h-[calc(100svh-(var(--spacing)*24))]">
				Hero Section
			</div>
		</Container>
	);
}

export default function Home() {
	return (
		<Fragment>
			<Navigation />
			<HeroSection />
		</Fragment>
	);
}
