type DevelopmentNavProps = {
  activePage: "m0" | "m1" | "m2" | "game";
};

export function DevelopmentNav({ activePage }: DevelopmentNavProps) {
  return (
    <nav className="development-nav" aria-label="Development laboratories">
      <a aria-current={activePage === "m0" ? "page" : undefined} href="/">
        <span>M0</span>
        System baseline
      </a>
      <a
        aria-current={activePage === "m1" ? "page" : undefined}
        href="/lab/camera"
      >
        <span>M1</span>
        Camera laboratory
      </a>
      <a
        aria-current={activePage === "m2" ? "page" : undefined}
        href="/lab/landmarks"
      >
        <span>M2</span>
        Landmark laboratory
      </a>
      <a aria-current={activePage === "game" ? "page" : undefined} href="/game">
        <span>M4</span>
        Visitor game
      </a>
    </nav>
  );
}
