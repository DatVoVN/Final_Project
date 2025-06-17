import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
import BASE_URL from "@/utils/config";
import Link from "next/link";
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg ${className}`}>{children}</div>
);
const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

export default function CvSuggestJobs() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const inputRef = useRef();

  useEffect(() => {
    if (!open) {
      setFile(null);
      setData(null);
      setError("");
      setLoading(false);
    }
  }, [open]);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
    setData(null);
    setError("");
  };

  const submit = async () => {
    if (!file) return setError("Vui lòng chọn file PDF CV trước.");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("cv", file);
      const res = await fetch(`${BASE_URL}/api/upload-and-match`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error((await res.json()).error || "Lỗi server");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="z-40 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl flex items-center justify-center transition-colors"
        aria-label="Phân tích CV"
      >
        <Upload className="w-6 h-6" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl mx-auto"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-1.5 shadow"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
            <Card className="w-full">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <h1 className="text-2xl font-semibold">Gợi ý việc làm từ CV</h1>

                <input
                  type="file"
                  accept="application/pdf"
                  ref={inputRef}
                  onChange={handleFile}
                  className="hidden"
                />
                <button
                  onClick={() => inputRef.current?.click()}
                  className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-slate-50"
                >
                  <Upload size={18} /> Chọn file PDF
                </button>
                {file && <p className="text-sm text-gray-600">{file.name}</p>}

                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-40 px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Phân tích"}
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}

                {data && (
                  <div className="w-full mt-4 text-left">
                    <h2 className="text-lg font-medium mb-2">
                      KẾT QUẢ PHÂN TÍCH CV
                    </h2>
                    <p className="text-sm mb-1 text-gray-700">
                      KỸ NĂNG: {data.structuredCV.skills?.join(", ")}
                    </p>
                    <p className="text-sm mb-2 text-gray-700">
                      ROLE PHÙ HỢP:{" "}
                      {data.suggestedRoles.map((r) => r.role).join(", ")}
                    </p>

                    <div className="overflow-x-auto max-h-80 border rounded-lg mt-3">
                      <table className="min-w-full text-sm">
                        <thead className="sticky top-0 bg-slate-100">
                          <tr className="border-b font-semibold">
                            <th className="py-1 px-2 text-left">Công việc</th>
                            <th className="py-1 px-2 text-left">Role</th>
                            <th className="py-1 px-2 text-right">% Trùng</th>
                            <th className="py-1 px-2 text-right">Điểm</th>
                            <th className="py-1 px-2 text-left">Lý do</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.matches.map((m) => (
                            <tr
                              key={m.jobId}
                              className="border-b last:border-0"
                            >
                              <td
                                className="py-1 px-2 max-w-[200px] truncate text-blue-600 hover:underline"
                                title={m.title}
                              >
                                <Link href={`/jobdetail/${m.jobId}`}>
                                  {m.title}
                                </Link>
                              </td>
                              <td className="py-1 px-2">{m.matchedRole}</td>
                              <td className="py-1 px-2 text-right">
                                {m.similarity}%
                              </td>
                              <td className="py-1 px-2 text-right">
                                {m.score}
                              </td>
                              <td className="py-1 px-2 text-left">
                                {m.reason}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
