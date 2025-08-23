import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome to the Todo App</h1>
      <div className="flex justify-end mt-4">
        <Button asChild>
          <Link href="/todo">Todo</Link>
        </Button>
      </div>
    </div>
  );
}
