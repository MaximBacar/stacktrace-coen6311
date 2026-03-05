import { useState } from 'react'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from 'react-router-dom'

export default function RegistrationPage() {
    const [role, setRole] = useState('member')

    return (
        <section className="flex min-h-0 h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-transparent">
            <form action="" className="max-w-92 m-auto h-fit w-full">
                <div className="p-6">
                    <div>
                        <Link to="/" aria-label="go home">
                            <Logo className="h-10 w-auto" />
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Create an account</h1>
                        <p>Get started with your free account today</p>
                    </div>

                    <div className="mt-6 flex rounded-lg border p-1">
                        <button
                            type="button"
                            onClick={() => setRole('member')}
                            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${role === 'member' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            Member
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('coach')}
                            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${role === 'coach' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                            Coach
                        </button>
                    </div>

                    <div className="mt-6 space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="first_name" className="block text-sm">First Name</Label>
                                <Input type="text" id="first_name" name="first_name" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last_name" className="block text-sm">Last Name</Label>
                                <Input type="text" id="last_name" name="last_name" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="block text-sm">Email</Label>
                            <Input type="email" id="email" name="email" placeholder="you@example.com" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="block text-sm">Password</Label>
                            <Input type="password" id="password" name="password" required />
                        </div>

                        {role === 'member' && (
                            <div className="space-y-2">
                                <Label htmlFor="dob" className="block text-sm">Date of Birth</Label>
                                <Input type="date" id="dob" name="dob" required />
                            </div>
                        )}

                        <Button className="w-full">Create Account</Button>
                    </div>
                </div>

                <p className="text-accent-foreground text-center text-sm">
                    Already have an account?
                    <Button asChild variant="link" className="px-2">
                        <Link to="/login">Sign in</Link>
                    </Button>
                </p>
            </form>
        </section>
    )
}
