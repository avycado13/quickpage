import { useState } from 'react'
import './App.css'
import { GoogleLogin } from '@react-oauth/google'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Mail,
  CheckSquare,
  BookOpen,
  CalendarDays,
  Clock,
  Paperclip,
  GripVertical,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const mockEmails = [
  { id: 1, from: 'Prof. Johnson', subject: 'Midterm grades posted', time: '10:32 AM', unread: true },
  { id: 2, from: 'Study Group', subject: 'Meeting tomorrow at 3pm', time: '9:15 AM', unread: true },
  { id: 3, from: 'Canvas', subject: 'New announcement in CS 301', time: 'Yesterday', unread: false },
  { id: 4, from: 'Library', subject: 'Your hold is ready for pickup', time: 'Yesterday', unread: false },
  { id: 5, from: 'Financial Aid', subject: 'Action required: verify enrollment', time: 'Mon', unread: false },
]

const mockTodos = [
  { id: 1, text: 'Finish lab report', done: false, priority: 'high' },
  { id: 2, text: 'Read chapters 5–7', done: false, priority: 'medium' },
  { id: 3, text: 'Submit scholarship app', done: false, priority: 'high' },
  { id: 4, text: 'Buy groceries', done: true, priority: 'low' },
  { id: 5, text: 'Email advisor', done: true, priority: 'medium' },
]

const mockAssignments = [
  { id: 1, course: 'CS 301', title: 'Algorithm Analysis HW4', due: 'Tomorrow, 11:59 PM', hasAttachment: true },
  { id: 2, course: 'MATH 250', title: 'Problem Set 6', due: 'Thu, 11:59 PM', hasAttachment: false },
  { id: 3, course: 'ENG 102', title: 'Essay Draft 2', due: 'Fri, 5:00 PM', hasAttachment: true },
  { id: 4, course: 'CS 301', title: 'Lab 5: Graph Traversal', due: 'Next Mon', hasAttachment: true },
]

const mockCalendar = [
  { id: 1, title: 'CS 301 Lecture', time: '9:00 – 10:15 AM', color: 'bg-blue-500' },
  { id: 2, title: 'Office Hours w/ Prof. Johnson', time: '11:00 AM – 12:00 PM', color: 'bg-emerald-500' },
  { id: 3, title: 'Study Group', time: '3:00 – 4:30 PM', color: 'bg-violet-500' },
  { id: 4, title: 'MATH 250 Lecture', time: '5:00 – 6:15 PM', color: 'bg-amber-500' },
]

const priorityColor = {
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
} as const

function SortableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="xl:col-span-2">
      <Card className="relative h-full">
        <button
          {...attributes}
          {...listeners}
          className="absolute right-3 top-3 z-10 cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        {children}
      </Card>
    </div>
  )
}

function EmailCard() {
  return (
    <>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <Mail className="h-5 w-5 text-muted-foreground" />
        <div>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>
            {mockEmails.filter((e) => e.unread).length} unread
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-72">
          {mockEmails.map((email) => (
            <div key={email.id}>
              <button className="flex w-full items-start gap-3 px-6 py-3 text-left hover:bg-muted/50 transition-colors">
                {email.unread && (
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                )}
                <div className={`min-w-0 flex-1 ${!email.unread ? 'ml-5' : ''}`}>
                  <p className={`truncate text-sm ${email.unread ? 'font-semibold' : ''}`}>
                    {email.from}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {email.subject}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{email.time}</span>
              </button>
              <Separator />
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </>
  )
}

function CalendarCard() {
  return (
    <>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <CalendarDays className="h-5 w-5 text-muted-foreground" />
        <div>
          <CardTitle>Today</CardTitle>
          <CardDescription>{mockCalendar.length} events</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-72">
          <div className="space-y-1 px-6 py-3">
            {mockCalendar.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${event.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {event.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </>
  )
}

function TodoCard() {
  return (
    <>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <CheckSquare className="h-5 w-5 text-muted-foreground" />
        <div>
          <CardTitle>To-do</CardTitle>
          <CardDescription>
            {mockTodos.filter((t) => !t.done).length} remaining
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-72">
          {mockTodos.map((todo) => (
            <div key={todo.id}>
              <label className="flex cursor-pointer items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors">
                <Checkbox checked={todo.done} />
                <span
                  className={`flex-1 text-sm ${todo.done ? 'text-muted-foreground line-through' : ''}`}
                >
                  {todo.text}
                </span>
                <Badge variant={priorityColor[todo.priority as keyof typeof priorityColor]}>{todo.priority}</Badge>
              </label>
              <Separator />
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </>
  )
}

function ClassroomCard() {
  return (
    <>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <BookOpen className="h-5 w-5 text-muted-foreground" />
        <div>
          <CardTitle>Classroom</CardTitle>
          <CardDescription>Upcoming assignments</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-72">
          {mockAssignments.map((a) => (
            <div key={a.id}>
              <div className="flex items-start gap-3 px-6 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="shrink-0">
                      {a.course}
                    </Badge>
                    {a.hasAttachment && (
                      <Paperclip className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium">{a.title}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Due {a.due}
                  </p>
                </div>
              </div>
              <Separator />
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </>
  )
}

const cardComponents: Record<string, () => React.ReactNode> = {
  email: EmailCard,
  calendar: CalendarCard,
  todo: TodoCard,
  classroom: ClassroomCard,
}

const defaultCardOrder = ['email', 'calendar', 'todo', 'classroom']

function App() {
  const [cardOrder, setCardOrder] = useState(defaultCardOrder)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setCardOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as string)
        const newIndex = prev.indexOf(over.id as string)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const today = new Date()
  const greeting =
    today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening'
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-muted-foreground">{dateStr}</p>
        </div>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            console.log(credentialResponse)
          }}
          onError={() => {
            console.log('Login Failed')
          }}
          shape="circle"
          type="icon"
        />
      </header>

      {/* Dashboard Grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cardOrder} strategy={rectSortingStrategy}>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {cardOrder.map((id) => {
              const CardComponent = cardComponents[id]
              return (
                <SortableCard key={id} id={id}>
                  <CardComponent />
                </SortableCard>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default App
