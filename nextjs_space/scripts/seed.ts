import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user (test account)
  const adminPassword = await bcrypt.hash('johndoe123', 12)
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Sample employee
  const empPassword = await bcrypt.hash('employee123', 12)
  const employee = await prisma.user.upsert({
    where: { email: 'jane@company.com' },
    update: {},
    create: {
      email: 'jane@company.com',
      name: 'Jane Smith',
      password: empPassword,
      role: 'EMPLOYEE',
    },
  })

  // Admin user for the user
  const adminUser2Password = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: {
      email: 'admin@company.com',
      name: 'Admin User',
      password: adminUser2Password,
      role: 'ADMIN',
    },
  })

  // Create some sample time entries for the past week
  const admin = await prisma.user.findUnique({ where: { email: 'john@doe.com' } })
  const projects = ['Website Redesign', 'Mobile App', 'API Development', 'General', 'Client Meeting']
  const tasks = ['Frontend development', 'Backend coding', 'Code review', 'Bug fixing', 'Design discussion', 'Sprint planning']

  const now = new Date()
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(now)
    date.setDate(date.getDate() - dayOffset)
    date.setHours(0, 0, 0, 0)

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue

    // Add 1-2 entries per day for admin
    if (admin) {
      const entries = dayOffset === 0 ? 1 : Math.floor(Math.random() * 2) + 1
      for (let j = 0; j < entries; j++) {
        const startHour = 9 + j * 4
        const durationHours = 2 + Math.floor(Math.random() * 3)
        const startTime = new Date(date)
        startTime.setHours(startHour, 0, 0, 0)
        const endTime = new Date(startTime)
        endTime.setHours(startHour + durationHours, 0, 0, 0)
        const duration = durationHours * 3600

        await prisma.timeEntry.upsert({
          where: { id: `seed-admin-${dayOffset}-${j}` },
          update: {},
          create: {
            id: `seed-admin-${dayOffset}-${j}`,
            userId: admin.id,
            date: date,
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            project: projects[Math.floor(Math.random() * projects.length)] ?? 'General',
            task: tasks[Math.floor(Math.random() * tasks.length)] ?? '',
            notes: '',
            isClockIn: false,
          },
        })
      }
    }

    // Add entries for employee
    const startTime = new Date(date)
    startTime.setHours(9, 30, 0, 0)
    const endTime = new Date(date)
    endTime.setHours(17, 0, 0, 0)
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000)

    await prisma.timeEntry.upsert({
      where: { id: `seed-emp-${dayOffset}` },
      update: {},
      create: {
        id: `seed-emp-${dayOffset}`,
        userId: employee.id,
        date: date,
        startTime: startTime,
        endTime: endTime,
        duration: duration,
        project: projects[Math.floor(Math.random() * projects.length)] ?? 'General',
        task: tasks[Math.floor(Math.random() * tasks.length)] ?? '',
        notes: '',
        isClockIn: false,
      },
    })
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
