const Body = () => {
  return (
    <>
      <div style={{ height: "var(--header-height, 72px)" }} />
      <div className="h-screen relative">
        <div
          className="absolute inset-0 -z-5 pointer-events-none opacity-100"
          style={{
            backgroundImage: `
                repeating-linear-gradient(45deg, rgba(0,0,0,0.1) 0, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 20px),
                repeating-linear-gradient(-45deg, rgba(0,0,0,0.1) 0, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 20px)
              `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
    </>
  );
};

export default Body;
