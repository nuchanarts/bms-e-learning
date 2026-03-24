import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseService, type Course, type Video } from '../../services/courseService';
import { progressService, type ProgressRecord } from '../../services/progressService';
import { certificateService } from '../../services/certificateService';
import { VideoPlayer } from '../../components/ui/VideoPlayer';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseCompleted, setCourseCompleted] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([courseService.getById(id), progressService.getForCourse(id)])
      .then(([c, p]) => {
        setCourse(c);
        setProgress(p);
        setSelectedVideo(c.videos[0] ?? null);
        if (c.videos.length > 0 && p.filter(x => x.completed).length === c.videos.length)
          setCourseCompleted(true);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleProgress = (_percent: number, videoCompleted: boolean) => {
    if (!selectedVideo || !course) return;
    setProgress(prev => {
      const updated = prev.filter(p => p.videoId !== selectedVideo.id);
      updated.push({ videoId: selectedVideo.id, courseId: course.id, percent: _percent, completed: videoCompleted });
      if (videoCompleted && updated.filter(p => p.completed).length === course.videos.length)
        setCourseCompleted(true);
      return updated;
    });
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!course) return <div className="glass-card p-12 text-center"><p className="text-4xl mb-3">❌</p><p style={{ color: '#dc2626' }}>ไม่พบคอร์ส</p></div>;

  const getVP = (vid: string) => progress.find(p => p.videoId === vid);
  const completedCount = progress.filter(p => p.completed).length;
  const totalVideos = course.videos.length;
  const overallPercent = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: '#7B68EE' }}>
        ← กลับไปรายการคอร์ส
      </Link>

      {/* Course header */}
      <div className="glass-card p-6 animate-[fadeUp_0.5s_ease]">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>{course.title}</h1>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>🎬 {totalVideos} วิดีโอ</span>
              <span>✅ เรียนจบ {completedCount} บท</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {overallPercent}%
            </p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>ความคืบหน้า</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(123,104,238,0.1)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${overallPercent}%`, background: courseCompleted ? 'var(--gradient-success)' : 'var(--gradient-primary)' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Video player */}
        <div className="lg:col-span-2 space-y-4">
          {selectedVideo && (
            <div className="glass-card overflow-hidden animate-[fadeUp_0.4s_ease]">
              <VideoPlayer videoId={selectedVideo.id} courseId={course.id} url={selectedVideo.url} onProgress={handleProgress} />
              <div className="p-5">
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{selectedVideo.title}</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  ⏱️ {Math.floor(selectedVideo.duration / 60)} นาที {selectedVideo.duration % 60} วินาที
                </p>
              </div>
            </div>
          )}

          {/* Certificate banner */}
          {courseCompleted && (
            <div className="p-5 rounded-3xl border-2 flex items-center justify-between flex-wrap gap-4"
              style={{ background: 'linear-gradient(135deg,rgba(76,175,80,0.1),rgba(102,187,106,0.05))', border: '2px solid rgba(76,175,80,0.3)' }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <p className="font-bold" style={{ color: '#2e7d32' }}>ยินดีด้วย! คุณเรียนจบคอร์สนี้แล้ว</p>
                  <p className="text-sm" style={{ color: '#4CAF50' }}>ดาวน์โหลดใบประกาศได้เลย</p>
                </div>
              </div>
              <a href={certificateService.downloadUrl(course.id)} target="_blank" rel="noopener noreferrer">
                <button className="flex items-center gap-2 px-5 py-2 rounded-2xl font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: 'var(--gradient-success)', boxShadow: '0 8px 24px rgba(76,175,80,0.4)' }}>
                  ⬇️ ดาวน์โหลดใบประกาศ
                </button>
              </a>
            </div>
          )}
        </div>

        {/* Video list */}
        <div className="glass-card p-5 h-fit animate-[fadeUp_0.5s_ease]">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>📋 รายการวิดีโอ</h3>
          <ul className="space-y-2">
            {course.videos.map((video, idx) => {
              const vp = getVP(video.id);
              const isSelected = selectedVideo?.id === video.id;
              return (
                <li key={video.id}>
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="w-full text-left p-3 rounded-2xl text-sm transition-all duration-300"
                    style={isSelected
                      ? { background: 'rgba(123,104,238,0.15)', border: '2px solid rgba(123,104,238,0.4)' }
                      : { background: 'rgba(255,255,255,0.5)', border: '2px solid rgba(123,104,238,0.1)' }
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={vp?.completed
                          ? { background: 'rgba(76,175,80,0.2)', color: '#4CAF50' }
                          : isSelected
                            ? { background: 'rgba(123,104,238,0.2)', color: '#7B68EE' }
                            : { background: 'rgba(123,104,238,0.1)', color: 'var(--text-tertiary)' }
                        }>
                        {vp?.completed ? '✓' : idx + 1}
                      </span>
                      <span className="flex-1 truncate font-medium" style={{ color: 'var(--text-primary)' }}>{video.title}</span>
                    </div>
                    {vp && !vp.completed && vp.percent > 0 && (
                      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(123,104,238,0.1)' }}>
                        <div className="h-full rounded-full" style={{ width: `${vp.percent}%`, background: 'var(--gradient-primary)' }} />
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
