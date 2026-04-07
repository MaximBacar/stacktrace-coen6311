import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, ChefHat, Clock, Flame, Leaf, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchRecipes, generateRecipe } from '@/lib/api'
import { fadeUp, spring, stagger } from './animations'

const EXAMPLE_PROMPTS = [
  'High-protein breakfast under 400 kcal',
  'Quick vegan lunch with lots of fibre',
  'Post-workout meal with chicken and rice',
  'Low-carb dinner for weight loss',
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MacroPill({ label, value, color }) {
  return (
    <div className={cn('flex flex-col items-center px-3 py-2 rounded-lg', color)}>
      <span className="text-xs font-medium">{value}g</span>
      <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
    </div>
  )
}

function RecipeCard({ recipe }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div variants={fadeUp} layout className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium leading-snug">{recipe.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{recipe.description}</p>
          </div>
          {recipe.prep_time && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <Clock size={12} strokeWidth={1.5} />
              {recipe.prep_time}
            </div>
          )}
        </div>

        {/* Tags & dietary labels */}
        {(recipe.tags?.length > 0 || recipe.dietary_restrictions?.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {[...recipe.dietary_restrictions, ...recipe.tags].map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                <Leaf size={10} strokeWidth={1.5} />
                {tag.replace(/_/g, '-')}
              </span>
            ))}
          </div>
        )}

        {/* Macros */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 flex-1 rounded-lg bg-muted/40 px-3 py-2">
            <Flame size={14} strokeWidth={1.5} className="text-orange-500 shrink-0" />
            <div>
              <span className="text-sm font-medium">{recipe.calories}</span>
              <span className="text-xs text-muted-foreground ml-1">kcal</span>
            </div>
          </div>
          <MacroPill label="Protein" value={recipe.protein} color="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300" />
          <MacroPill label="Carbs"   value={recipe.carbs}   color="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300" />
          <MacroPill label="Fat"     value={recipe.fat}     color="bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300" />
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="self-start text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          {expanded ? 'Hide details' : 'Show ingredients & steps'}
        </button>
      </div>

      {/* Expandable details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { ...spring, opacity: { duration: 0.2 } } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
            className="overflow-hidden border-t"
          >
            <div className="p-5 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-2">Ingredients</p>
                <ul className="flex flex-col gap-1.5">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-2">Steps</p>
                <ol className="flex flex-col gap-2">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 w-fit"
    >
      <ChefHat size={14} strokeWidth={1.5} className="text-muted-foreground" />
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main tab
// ---------------------------------------------------------------------------

export default function RecipesTab() {
  const queryClient = useQueryClient()
  const [input,         setInput]         = useState('')
  const [pendingPrompt, setPendingPrompt] = useState(null)
  const listEndRef  = useRef(null)
  const textareaRef = useRef(null)

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn:  fetchRecipes,
    refetchOnWindowFocus: false,
  })

  const generateMutation = useMutation({
    mutationFn: (prompt) => generateRecipe({ prompt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      setPendingPrompt(null)
    },
    onError: () => setPendingPrompt(null),
  })

  // Scroll to bottom when something appears
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [recipes.length, generateMutation.isPending])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  function submit(prompt = input) {
    const text = prompt.trim()
    if (!text || generateMutation.isPending) return
    setInput('')
    setPendingPrompt(text)
    generateMutation.mutate(text)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  const isEmpty = !isLoading && recipes.length === 0 && !generateMutation.isPending

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Recipe list */}
      <div className="flex-1 overflow-y-auto px-6 py-2">
        {isLoading ? (
          <div className="flex flex-col gap-3 pt-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-44 rounded-xl border bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : isEmpty ? (
          <motion.div
            className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring}
          >
            <div className="rounded-2xl border p-5 bg-muted/30">
              <Sparkles size={28} strokeWidth={1.2} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Ask for a recipe</p>
              <p className="text-sm text-muted-foreground mt-1">Describe what you're looking for and get a personalised suggestion saved to your collection.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-md">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => submit(prompt)}
                  disabled={generateMutation.isPending}
                  className="rounded-full border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col gap-4 pb-4 pt-2"
            variants={stagger(0.07)}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {recipes.map((recipe) => (
                <div key={recipe.id}>
                  {recipe.prompt && (
                    <motion.div variants={fadeUp} className="flex justify-end mb-3">
                      <span className="rounded-2xl rounded-br-sm bg-foreground text-background text-sm px-4 py-2 max-w-xs text-right">
                        {recipe.prompt}
                      </span>
                    </motion.div>
                  )}
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </AnimatePresence>

            {/* Pending prompt bubble + typing indicator */}
            {generateMutation.isPending && pendingPrompt && (
              <motion.div variants={fadeUp} initial="hidden" animate="show">
                <div className="flex justify-end mb-3">
                  <span className="rounded-2xl rounded-br-sm bg-foreground text-background text-sm px-4 py-2 max-w-xs text-right">
                    {pendingPrompt}
                  </span>
                </div>
                <TypingIndicator />
              </motion.div>
            )}
          </motion.div>
        )}

        {generateMutation.isError && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs text-destructive text-center pb-2"
          >
            Something went wrong. Please try again.
          </motion.p>
        )}

        <div ref={listEndRef} />
      </div>

      {/* Prompt bar */}
      <div className="shrink-0 border-t bg-background px-6 py-4">
        <form
          onSubmit={(e) => { e.preventDefault(); submit() }}
          className="flex items-end gap-3 rounded-xl border bg-muted/30 px-4 py-3 focus-within:ring-1 focus-within:ring-ring transition-shadow"
        >
          <ChefHat size={16} strokeWidth={1.5} className="text-muted-foreground shrink-0 mb-0.5" />
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={generateMutation.isPending}
            placeholder="Suggest a high-protein dinner under 600 kcal…"
            className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none leading-relaxed disabled:opacity-50"
            style={{ maxHeight: 160 }}
          />
          <button
            type="submit"
            disabled={!input.trim() || generateMutation.isPending}
            className={cn(
              'shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors',
              input.trim() && !generateMutation.isPending
                ? 'bg-foreground text-background hover:opacity-80'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            <ArrowUp size={15} strokeWidth={2} />
          </button>
        </form>
        <p className="text-[11px] text-muted-foreground text-center mt-2">
          Press <kbd className="rounded border px-1 py-0.5 text-[10px] font-mono">Enter</kbd> to send · <kbd className="rounded border px-1 py-0.5 text-[10px] font-mono">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
}
