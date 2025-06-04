import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/home/settings copy")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col w-96 mx-auto items-center justify-center gap-2 size-full">
      <input
        type="text"
        placeholder="Selam dünya"
        className="TextField w-full"
      />
      <input
        type="text"
        placeholder="Selam dünya"
        className="TextField w-full"
      />
      <input
        type="text"
        placeholder="Selam dünya"
        className="TextField w-full"
      />
      <button className="MainButton w-full">Selam Dünya</button>
    </div>
  );
}
