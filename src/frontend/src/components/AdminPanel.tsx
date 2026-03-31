import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Edit,
  Loader2,
  Lock,
  Newspaper,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Difficulty, Language, type Question } from "../backend";
import {
  useAddNotice,
  useAddPost,
  useAddQuestion,
  useDeleteNotice,
  useDeletePost,
  useDeleteQuestion,
  useGetAllNotices,
  useGetAllPosts,
  useGetAllQuestions,
  useGetAllUserAccounts,
  useUpdateNotice,
  useUpdatePost,
  useUpdateQuestion,
} from "../hooks/useQueries";
import type { LocalNotice, LocalPost } from "../hooks/useQueries";
import { CATEGORIES, type Lang, getCategoryLabel, t } from "../lib/i18n";
import {
  PLATFORM_INFO,
  type PlatformType,
  getAllLinkedAccounts,
} from "../lib/linkedAccounts";
import { SAMPLE_QUESTIONS } from "../lib/sampleQuestions";
import { getTransactions } from "../lib/wallet";

const ADMIN_PASSWORD = "admin123";
const STRIPE_KEY_STORAGE = "stripePublishableKey";

interface Props {
  lang: Lang;
  onBack: () => void;
}

const emptyForm = (): Omit<Question, "id"> => ({
  category: "General Knowledge",
  language: Language.english,
  questionText: "",
  options: ["", "", "", ""],
  correctIndex: BigInt(0),
  difficulty: Difficulty.medium,
});

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

export default function AdminPanel({ lang, onBack }: Props) {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      if (pwd === ADMIN_PASSWORD) {
        setAuthed(true);
        setAuthLoading(false);
        return;
      }
      setAuthError(t(lang, "wrongPassword"));
    } catch {
      setAuthError(t(lang, "wrongPassword"));
    } finally {
      setAuthLoading(false);
    }
  };

  if (!authed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center p-6"
        data-ocid="admin.page"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 space-y-6"
        >
          <div className="text-center">
            <Lock size={40} className="mx-auto mb-3 text-primary" />
            <h1 className="font-display text-2xl font-extrabold">
              {t(lang, "adminPanel")}
            </h1>
          </div>
          <div className="space-y-3">
            <Label htmlFor="admin-pwd">{t(lang, "password")}</Label>
            <Input
              id="admin-pwd"
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-secondary border-border text-foreground h-12"
              data-ocid="admin.input"
            />
            {authError && (
              <p
                className="text-destructive text-sm"
                data-ocid="admin.error_state"
              >
                {authError}
              </p>
            )}
            <Button
              onClick={handleLogin}
              disabled={authLoading || !pwd.trim()}
              className="w-full h-12 font-display font-bold bg-primary neon-glow-purple"
              data-ocid="admin.submit_button"
            >
              {authLoading ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : null}
              {t(lang, "login")}
            </Button>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="w-full text-muted-foreground text-sm hover:text-foreground flex items-center justify-center gap-1 min-h-[44px]"
            data-ocid="admin.back_button"
          >
            <ArrowLeft size={16} />
            {t(lang, "back")}
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return <AdminDashboard lang={lang} onBack={onBack} />;
}

function AdminDashboard({ lang, onBack }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col"
      data-ocid="admin.page"
    >
      <header className="flex items-center gap-3 p-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
          data-ocid="admin.back_button"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" />
          <h1 className="font-display text-xl font-extrabold">
            {t(lang, "adminPanel")}
          </h1>
        </div>
      </header>

      <div className="flex-1 px-4 pb-8">
        <Tabs defaultValue="users">
          <TabsList className="w-full mb-4 bg-secondary border border-border flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger
              value="users"
              className="flex-1 font-display text-xs min-w-[60px]"
              data-ocid="admin.tab"
            >
              <Users size={12} className="mr-1" />
              ব্যবহারকারী
            </TabsTrigger>
            <TabsTrigger
              value="notices"
              className="flex-1 font-display text-xs min-w-[60px]"
              data-ocid="admin.tab"
            >
              📢 নোটিশ
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className="flex-1 font-display text-xs min-w-[60px]"
              data-ocid="admin.tab"
            >
              <Newspaper size={12} className="mr-1" />
              পোস্ট
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="flex-1 font-display text-xs min-w-[60px]"
              data-ocid="admin.tab"
            >
              📝 প্রশ্ন
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex-1 font-display text-xs min-w-[60px]"
              data-ocid="admin.tab"
            >
              💳 লেনদেন
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex-1 font-display text-xs min-w-[60px]"
              data-ocid="admin.tab"
            >
              <Settings size={12} className="mr-1" />
              সেটিংস
            </TabsTrigger>
            <TabsTrigger
              value="linked"
              className="flex-1 font-display text-xs min-w-[60px]"
              data-ocid="admin.tab"
            >
              🔗 একাউন্ট
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="notices">
            <NoticesTab />
          </TabsContent>
          <TabsContent value="posts">
            <PostsTab />
          </TabsContent>
          <TabsContent value="questions">
            <QuestionsTab lang={lang} />
          </TabsContent>
          <TabsContent value="transactions">
            <TransactionsTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
          <TabsContent value="linked">
            <LinkedAccountsAdminTab />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}

// ── Users Tab ───────────────────────────────────────────────────────────────────────

function UsersTab() {
  const { data: accounts, isLoading, refetch } = useGetAllUserAccounts();

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider">
          মোট ব্যবহারকারী: {accounts?.length ?? 0}
        </h3>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-xs text-primary hover:text-accent px-2 py-1 border border-primary/30 rounded"
        >
          রিফ্রেশ
        </button>
      </div>
      {isLoading ? (
        <div
          className="flex justify-center py-12"
          data-ocid="admin.loading_state"
        >
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="admin.empty_state"
        >
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p>এখনো কোনো ব্যবহারকারী নেই</p>
          <p className="text-xs mt-2">ব্যবহারকারী রেজিস্ট্রেশন করলে এখানে দেখায়াবে</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table data-ocid="admin.table">
            <TableHeader>
              <TableRow>
                <TableHead className="font-display text-xs">#</TableHead>
                <TableHead className="font-display text-xs">ইউজারনেম</TableHead>
                <TableHead className="font-display text-xs">পাসওয়ার্ড</TableHead>
                <TableHead className="font-display text-xs">তারিখ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((acc, i) => (
                <TableRow key={acc.username} data-ocid={`admin.item.${i + 1}`}>
                  <TableCell className="text-muted-foreground text-xs">
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-display font-bold text-sm text-accent">
                    {acc.username}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs bg-secondary border border-border px-2 py-1 rounded">
                      {acc.password}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(acc.createdAt).toLocaleDateString("bn-BD")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ── Notices Tab ──────────────────────────────────────────────────────────────────

interface NoticeForm {
  title: string;
  content: string;
  isActive: boolean;
}

function NoticesTab() {
  const { data: notices, isLoading } = useGetAllNotices();
  const addNotice = useAddNotice();
  const updateNotice = useUpdateNotice();
  const deleteNotice = useDeleteNotice();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LocalNotice | null>(null);
  const [form, setForm] = useState<NoticeForm>({
    title: "",
    content: "",
    isActive: true,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ title: "", content: "", isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (n: LocalNotice) => {
    setEditTarget(n);
    setForm({ title: n.title, content: n.content, isActive: n.isActive });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("শিরোনাম ও বিষয়বস্তু লিখুন");
      return;
    }
    try {
      if (editTarget) {
        await updateNotice.mutateAsync({
          id: editTarget.id,
          title: form.title,
          content: form.content,
          isActive: form.isActive,
        });
        toast.success("নোটিশ আপডেট হয়েছে");
      } else {
        await addNotice.mutateAsync({
          title: form.title,
          content: form.content,
        });
        toast.success("নোটিশ যোগ হয়েছে ✅");
      }
      setDialogOpen(false);
    } catch (e) {
      toast.error(`ত্রুটি হয়েছে: ${String(e)}`);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteNotice.mutateAsync(id);
    toast.success("নোটিশ মুছে ফেলা হয়েছে");
    setDeleteConfirm(null);
  };

  const isMutating =
    addNotice.isPending || updateNotice.isPending || deleteNotice.isPending;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider">
          মোট নোটিশ: {notices?.length ?? 0}
        </h3>
        <Button
          size="sm"
          onClick={openAdd}
          className="bg-primary font-display neon-glow-purple min-h-[44px]"
          data-ocid="admin.primary_button"
        >
          <Plus size={16} className="mr-1" />
          নোটিশ যোগ করুন
        </Button>
      </div>

      {isLoading ? (
        <div
          className="flex justify-center py-12"
          data-ocid="admin.loading_state"
        >
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : !notices || notices.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="admin.empty_state"
        >
          <p>কোনো নোটিশ নেই। নতুন নোটিশ যোগ করুন।</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice, i) => (
            <div
              key={notice.id}
              className="rounded-xl border border-border bg-card p-4"
              data-ocid={`admin.item.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-display font-bold text-sm truncate">
                      {notice.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 ${
                        notice.isActive
                          ? "border-green-500 text-green-400"
                          : "border-muted text-muted-foreground"
                      }`}
                    >
                      {notice.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notice.content}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(notice)}
                    className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                    data-ocid={`admin.edit_button.${i + 1}`}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(notice.id)}
                    className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                    data-ocid={`admin.delete_button.${i + 1}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="bg-card border-border text-foreground max-w-md"
          data-ocid="admin.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editTarget ? "নোটিশ সম্পাদনা" : "নতুন নোটিশ"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">শিরোনাম *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="নোটিশের শিরোনাম"
                className="bg-secondary border-border mt-1"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label className="text-sm">বিষয়বস্তু *</Label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="নোটিশের বিষয়বস্তু লিখুন..."
                className="bg-secondary border-border mt-1 min-h-[100px]"
                data-ocid="admin.textarea"
              />
            </div>
            {editTarget && (
              <div className="flex items-center justify-between">
                <Label className="text-sm">সক্রিয় করুন</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, isActive: v }))
                  }
                  data-ocid="admin.switch"
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="flex-1"
              data-ocid="admin.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !form.title.trim() || !form.content.trim() || isMutating
              }
              className="flex-1 bg-primary font-bold neon-glow-purple"
              data-ocid="admin.save_button"
            >
              {isMutating ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : null}
              সংরক্ষণ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent
          className="bg-card border-border text-foreground max-w-sm"
          data-ocid="admin.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              নোটিশ মুছুন
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            এই নোটিশটি মুছে ফেলতে চান?
          </p>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1"
              data-ocid="admin.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              onClick={() =>
                deleteConfirm !== null && handleDelete(deleteConfirm)
              }
              disabled={deleteNotice.isPending}
              className="flex-1 bg-destructive text-destructive-foreground font-bold"
              data-ocid="admin.confirm_button"
            >
              {deleteNotice.isPending ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : null}
              মুছুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Posts Tab ───────────────────────────────────────────────────────────────────

interface PostForm {
  title: string;
  content: string;
  imageUrl: string;
}

function PostsTab() {
  const { data: posts, isLoading } = useGetAllPosts();
  const addPost = useAddPost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LocalPost | null>(null);
  const [form, setForm] = useState<PostForm>({
    title: "",
    content: "",
    imageUrl: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const openAdd = () => {
    setEditTarget(null);
    setForm({ title: "", content: "", imageUrl: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: LocalPost) => {
    setEditTarget(p);
    setForm({ title: p.title, content: p.content, imageUrl: p.imageUrl });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("শিরোনাম ও বিষয়বস্তু লিখুন");
      return;
    }
    try {
      if (editTarget) {
        await updatePost.mutateAsync({
          id: editTarget.id,
          title: form.title,
          content: form.content,
          imageUrl: form.imageUrl,
        });
        toast.success("পোস্ট আপডেট হয়েছে");
      } else {
        await addPost.mutateAsync({
          title: form.title,
          content: form.content,
          imageUrl: form.imageUrl,
        });
        toast.success("পোস্ট যোগ হয়েছে ✅");
      }
      setDialogOpen(false);
    } catch (e) {
      toast.error(`ত্রুটি: ${String(e)}`);
    }
  };

  const handleDelete = async (id: number) => {
    await deletePost.mutateAsync(id);
    toast.success("পোস্ট মুছে ফেলা হয়েছে");
    setDeleteConfirm(null);
  };

  const isMutating =
    addPost.isPending || updatePost.isPending || deletePost.isPending;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider">
          মোট পোস্ট: {posts?.length ?? 0}
        </h3>
        <Button
          size="sm"
          onClick={openAdd}
          className="bg-primary font-display neon-glow-purple min-h-[44px]"
          data-ocid="admin.primary_button"
        >
          <Plus size={16} className="mr-1" />
          পোস্ট যোগ করুন
        </Button>
      </div>

      {isLoading ? (
        <div
          className="flex justify-center py-12"
          data-ocid="admin.loading_state"
        >
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : !posts || posts.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="admin.empty_state"
        >
          <p>কোনো পোস্ট নেই। নতুন পোস্ট যোগ করুন।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <div
              key={post.id}
              className="rounded-xl border border-border bg-card overflow-hidden"
              data-ocid={`admin.item.${i + 1}`}
            >
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(post)}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                      data-ocid={`admin.edit_button.${i + 1}`}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(post.id)}
                      className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                      data-ocid={`admin.delete_button.${i + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="bg-card border-border text-foreground max-w-md"
          data-ocid="admin.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editTarget ? "পোস্ট সম্পাদনা" : "নতুন পোস্ট"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">শিরোনাম *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="পোস্টের শিরোনাম"
                className="bg-secondary border-border mt-1"
                data-ocid="admin.input"
              />
            </div>
            <div>
              <Label className="text-sm">বিষয়বস্তু *</Label>
              <Textarea
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="পোস্টের বিষয়বস্তু লিখুন..."
                className="bg-secondary border-border mt-1 min-h-[100px]"
                data-ocid="admin.textarea"
              />
            </div>
            <div>
              <Label className="text-sm">ছবির URL (ঐচ্ছিক)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://..."
                className="bg-secondary border-border mt-1 font-mono text-xs"
                data-ocid="admin.input"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="flex-1"
              data-ocid="admin.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !form.title.trim() || !form.content.trim() || isMutating
              }
              className="flex-1 bg-primary font-bold neon-glow-purple"
              data-ocid="admin.save_button"
            >
              {isMutating ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : null}
              সংরক্ষণ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent
          className="bg-card border-border text-foreground max-w-sm"
          data-ocid="admin.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              পোস্ট মুছুন
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            এই পোস্টটি মুছে ফেলতে চান?
          </p>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1"
              data-ocid="admin.cancel_button"
            >
              বাতিল
            </Button>
            <Button
              onClick={() =>
                deleteConfirm !== null && handleDelete(deleteConfirm)
              }
              disabled={deletePost.isPending}
              className="flex-1 bg-destructive text-destructive-foreground font-bold"
              data-ocid="admin.confirm_button"
            >
              {deletePost.isPending ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : null}
              মুছুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Questions Tab ────────────────────────────────────────────────────────────────

function QuestionsTab({ lang }: { lang: Lang }) {
  const { data: backendQs, isLoading } = useGetAllQuestions();
  const questions: Question[] = (() => {
    if (backendQs && backendQs.length > 0) return backendQs;
    return SAMPLE_QUESTIONS;
  })();

  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Question | null>(null);
  const [form, setForm] = useState<Omit<Question, "id">>(emptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<bigint | null>(null);
  const [filterCat, setFilterCat] = useState("All");
  const [filterLang, setFilterLang] = useState("All");

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };
  const openEdit = (q: Question) => {
    setEditTarget(q);
    setForm({
      category: q.category,
      language: q.language,
      questionText: q.questionText,
      options: [...q.options],
      correctIndex: q.correctIndex,
      difficulty: q.difficulty,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.questionText.trim()) return;
    try {
      if (editTarget) {
        await updateQuestion.mutateAsync({
          id: editTarget.id,
          question: { ...form, id: editTarget.id },
        });
      } else {
        await addQuestion.mutateAsync({ ...form, id: BigInt(0) });
      }
      setDialogOpen(false);
    } catch {
      setDialogOpen(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteQuestion.mutateAsync(id);
    } catch {}
    setDeleteConfirm(null);
  };

  const filtered = questions.filter((q) => {
    const catOk = filterCat === "All" || q.category === filterCat;
    const langOk =
      filterLang === "All" ||
      (filterLang === "bengali"
        ? q.language === Language.bengali
        : q.language === Language.english);
    return catOk && langOk;
  });

  const isMutating =
    addQuestion.isPending ||
    updateQuestion.isPending ||
    deleteQuestion.isPending;

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2">
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger
              className="w-36 bg-secondary border-border h-9"
              data-ocid="admin.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t(lang, "all")}</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.key} value={c.key}>
                  {getCategoryLabel(lang, c.key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterLang} onValueChange={setFilterLang}>
            <SelectTrigger
              className="w-28 bg-secondary border-border h-9"
              data-ocid="admin.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t(lang, "all")}</SelectItem>
              <SelectItem value="bengali">{t(lang, "bengaliLang")}</SelectItem>
              <SelectItem value="english">{t(lang, "englishLang")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          onClick={openAdd}
          className="bg-primary font-display neon-glow-purple min-h-[44px]"
          data-ocid="admin.primary_button"
        >
          <Plus size={16} className="mr-1" />
          {t(lang, "addQuestion")}
        </Button>
      </div>

      {isLoading ? (
        <div
          className="flex justify-center py-12"
          data-ocid="admin.loading_state"
        >
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="admin.empty_state"
        >
          <p>{t(lang, "noQuestions")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table data-ocid="admin.table">
            <TableHeader>
              <TableRow>
                <TableHead className="font-display text-xs">#</TableHead>
                <TableHead className="font-display text-xs">
                  {t(lang, "questionText")}
                </TableHead>
                <TableHead className="font-display text-xs hidden sm:table-cell">
                  {t(lang, "category")}
                </TableHead>
                <TableHead className="font-display text-xs" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((q, i) => (
                <TableRow key={String(q.id)} data-ocid={`admin.item.${i + 1}`}>
                  <TableCell className="text-muted-foreground text-xs">
                    {i + 1}
                  </TableCell>
                  <TableCell className="text-sm max-w-[180px] truncate">
                    {q.questionText}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                    {getCategoryLabel(lang, q.category)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(q)}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
                        data-ocid={`admin.edit_button.${i + 1}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(q.id)}
                        className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive min-h-[44px] min-w-[44px] flex items-center justify-center"
                        data-ocid={`admin.delete_button.${i + 1}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="bg-card border-border text-foreground max-w-lg w-full max-h-[90vh] overflow-y-auto"
          data-ocid="admin.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              {editTarget ? t(lang, "editQuestion") : t(lang, "addQuestion")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">{t(lang, "category")}</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger
                  className="bg-secondary border-border mt-1"
                  data-ocid="admin.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.key} value={c.key}>
                      {getCategoryLabel(lang, c.key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">{t(lang, "language")}</Label>
              <Select
                value={form.language}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, language: v as Language }))
                }
              >
                <SelectTrigger
                  className="bg-secondary border-border mt-1"
                  data-ocid="admin.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Language.bengali}>
                    {t(lang, "bengaliLang")}
                  </SelectItem>
                  <SelectItem value={Language.english}>
                    {t(lang, "englishLang")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">{t(lang, "difficulty")}</Label>
              <Select
                value={form.difficulty}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, difficulty: v as Difficulty }))
                }
              >
                <SelectTrigger
                  className="bg-secondary border-border mt-1"
                  data-ocid="admin.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Difficulty.easy}>
                    {t(lang, "easy")}
                  </SelectItem>
                  <SelectItem value={Difficulty.medium}>
                    {t(lang, "medium")}
                  </SelectItem>
                  <SelectItem value={Difficulty.hard}>
                    {t(lang, "hard")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">{t(lang, "questionText")}</Label>
              <Textarea
                value={form.questionText}
                onChange={(e) =>
                  setForm((f) => ({ ...f, questionText: e.target.value }))
                }
                className="bg-secondary border-border mt-1 min-h-[80px]"
                data-ocid="admin.textarea"
              />
            </div>
            <div>
              <Label className="text-sm">{t(lang, "options")}</Label>
              <div className="space-y-2 mt-1">
                {form.options.map((opt, i) => (
                  <div
                    key={OPTION_LABELS[i]}
                    className="flex items-center gap-2"
                  >
                    <span className="font-display font-bold w-6 text-muted-foreground text-sm">
                      {OPTION_LABELS[i]}.
                    </span>
                    <Input
                      value={opt}
                      onChange={(e) =>
                        setForm((f) => {
                          const options = [...f.options];
                          options[i] = e.target.value;
                          return { ...f, options };
                        })
                      }
                      className="bg-secondary border-border flex-1 h-10"
                      data-ocid="admin.input"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm">{t(lang, "correctAnswer")}</Label>
              <Select
                value={String(form.correctIndex)}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, correctIndex: BigInt(v) }))
                }
              >
                <SelectTrigger
                  className="bg-secondary border-border mt-1"
                  data-ocid="admin.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPTION_LABELS.map((label, i) => (
                    <SelectItem key={label} value={String(i)}>
                      {label}. {form.options[i]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="flex-1"
              data-ocid="admin.cancel_button"
            >
              {t(lang, "cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.questionText.trim() || isMutating}
              className="flex-1 bg-primary font-bold neon-glow-purple"
              data-ocid="admin.save_button"
            >
              {isMutating ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : null}
              {t(lang, "save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent
          className="bg-card border-border text-foreground max-w-sm"
          data-ocid="admin.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">
              {t(lang, "deleteQuestion")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            এই প্রশ্নটি মুছে ফেলতে চান?
          </p>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1"
              data-ocid="admin.cancel_button"
            >
              {t(lang, "cancel")}
            </Button>
            <Button
              onClick={() =>
                deleteConfirm !== null && handleDelete(deleteConfirm)
              }
              disabled={deleteQuestion.isPending}
              className="flex-1 bg-destructive text-destructive-foreground font-bold"
              data-ocid="admin.confirm_button"
            >
              {deleteQuestion.isPending ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : null}
              {t(lang, "delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Transactions Tab ──────────────────────────────────────────────────────────────

function TransactionsTab() {
  const transactions = getTransactions();
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider">
          মোট লেনদেন: {transactions.length}
        </h3>
      </div>
      {transactions.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="admin.empty_state"
        >
          <p>কোনো লেনদেন নেই</p>
        </div>
      ) : (
        <Table data-ocid="admin.table">
          <TableHeader>
            <TableRow>
              <TableHead className="font-display text-xs">ধরন</TableHead>
              <TableHead className="font-display text-xs">পরিমাণ</TableHead>
              <TableHead className="font-display text-xs">তারিখ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx, i) => (
              <TableRow key={tx.id} data-ocid={`admin.item.${i + 1}`}>
                <TableCell>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-display ${
                      tx.type === "deposit"
                        ? "bg-neon-green/20 text-neon-green"
                        : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {tx.type === "deposit" ? "জমা" : "উত্তোলন"}
                  </span>
                </TableCell>
                <TableCell
                  className={`font-bold text-sm ${
                    tx.type === "deposit"
                      ? "text-neon-green"
                      : "text-destructive"
                  }`}
                >
                  {tx.type === "deposit" ? "+" : "-"}৳{tx.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(tx.timestamp).toLocaleDateString("bn-BD")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab() {
  const [stripeKey, setStripeKey] = useState(
    () => localStorage.getItem(STRIPE_KEY_STORAGE) ?? "",
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem(STRIPE_KEY_STORAGE, stripeKey);
    setSaved(true);
    toast.success("সেটিংস সংরক্ষণ হয়েছে");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">💳</span>
          <div>
            <h3 className="font-display font-bold">Stripe পেমেন্ট সেটিংস</h3>
            <p className="text-xs text-muted-foreground">
              ওয়ালেট ডিপোজিটের জন্য Stripe পাবলিশেবল কী
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Stripe Publishable Key</Label>
          <Input
            type="password"
            value={stripeKey}
            onChange={(e) => setStripeKey(e.target.value)}
            placeholder="pk_live_... বা pk_test_..."
            className="bg-secondary border-border font-mono text-xs h-11"
            data-ocid="admin.input"
          />
        </div>
        <Button
          onClick={handleSave}
          className="w-full bg-primary neon-glow-purple font-display"
          data-ocid="admin.save_button"
        >
          <Save size={16} className="mr-2" />
          {saved ? "সংরক্ষিত ✓" : "সংরক্ষণ করুন"}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <h3 className="font-display font-bold">অ্যাপ তথ্য</h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            🔐 এডমিন পাসওয়ার্ড:{" "}
            <span className="font-mono text-foreground">admin123</span>
          </p>
          <p>🎮 প্রতি ৮ সঠিক = +৳১০ বোনাস</p>
          <p>❌ প্রতি ভুল = -৳২ কাটা</p>
        </div>
      </div>
    </div>
  );
}

function LinkedAccountsAdminTab() {
  const [accounts, setAccounts] = useState(() => getAllLinkedAccounts());
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );

  const refresh = () => setAccounts(getAllLinkedAccounts());

  const togglePassword = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const platformLabels: Record<PlatformType, string> = {
    facebook: "Facebook",
    telegram: "Telegram",
    email: "Email",
    binance: "Binance",
    kucoin: "KuCoin",
  };

  const platformColors: Record<PlatformType, string> = {
    facebook: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    telegram: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    email: "bg-red-500/20 text-red-400 border-red-500/30",
    binance: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    kucoin: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-base">🔗 যুক্ত একাউন্ট</h2>
          <p className="text-xs text-muted-foreground">
            মোট: {accounts.length} টি একাউন্ট
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={refresh}
          className="font-display text-xs"
        >
          🔄 রিফ্রেশ
        </Button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-display text-sm">
          এখনো কোনো একাউন্ট যোগ হয়নি
        </div>
      ) : (
        <div className="space-y-2">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-card border border-border rounded-xl p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${platformColors[acc.platform as PlatformType]}`}
                >
                  {platformLabels[acc.platform as PlatformType] || acc.platform}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(acc.addedAt).toLocaleDateString("bn-BD")}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20">
                    ইউজার/ইমেইল:
                  </span>
                  <span className="text-xs font-mono text-foreground">
                    {acc.username}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20">
                    পাসওয়ার্ড:
                  </span>
                  <span className="text-xs font-mono text-foreground">
                    {showPasswords[acc.id] ? acc.password : "••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePassword(acc.id)}
                    className="text-xs text-primary underline"
                  >
                    {showPasswords[acc.id] ? "লুকান" : "দেখুন"}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20">
                    ইউজার আইডি:
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {acc.userId}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
