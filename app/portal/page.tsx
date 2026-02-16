export default function Portal({ searchParams }: any) {
  const phone = searchParams?.phone || "";
  return (
    <main style={{padding:24, fontFamily:"system-ui"}}>
      <h2>Customer Portal (MVP)</h2>
      <p>Enter your phone to view your orders (basic MVP; secure login later).</p>
      <form>
        <input name="phone" defaultValue={phone} placeholder="+92..." />
        <button type="submit">View</button>
      </form>

      <p>In the 1-hour version, order history is viewable through the Sheets backend. Next step is secure auth.</p>
    </main>
  );
}
