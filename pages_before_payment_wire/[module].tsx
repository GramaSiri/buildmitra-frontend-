import { useRouter } from "next/router";

export default function ModulePage() {
  const router = useRouter();
  const { module } = router.query;

  return (
    <div style={{ padding: 20 }}>
      <h1>{module} Page Working ✔</h1>
    </div>
  );
}