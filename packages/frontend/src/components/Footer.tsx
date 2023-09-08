export default function Footer() {
  return (
    <div className="absolute bottom-0 right-0 left-0 font-mono text-gray-300 text-xs my-4">
      <div className="mx-auto max-w-3xl flex flex-col gap-3 items-center justify-center">
        <span>
          [ This test only works on Sepolia network or on a local network with
          foundry ]
        </span>
        <a href="https://github.com/0xBlackSonic/zkp-mixer" target="_blank">
          <img className="h-7 w-auto" src={"./github.svg"} alt="Github Repo" />
        </a>
      </div>
    </div>
  );
}
