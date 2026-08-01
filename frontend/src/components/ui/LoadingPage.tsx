export default function LoadingPage() {
  return (
    <div className="min-h-screen xbet-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-bright border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="teko text-xl text-muted tracking-widest">LOADING...</p>
      </div>
    </div>
  );
}
