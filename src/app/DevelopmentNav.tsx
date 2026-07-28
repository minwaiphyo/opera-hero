type DevelopmentNavProps = {
  activePage: "m0" | "m1";
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
    </nav>
  );
}
