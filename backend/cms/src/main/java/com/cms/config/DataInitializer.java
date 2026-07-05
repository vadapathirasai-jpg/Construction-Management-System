package com.cms.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.cms.entity.*;
import com.cms.repository.*;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private DailyReportRepository dailyReportRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Initializing MySQL database with demo data...");

            // Seeding Users
            userRepository.save(new User("USR-001", "Anita Sharma", "admin@buildtrack.com", passwordEncoder.encode("admin123"), "Admin", "Active"));
            userRepository.save(new User("USR-002", "Arun Kumar", "manager@buildtrack.com", passwordEncoder.encode("manager123"), "Project Manager", "Active"));
            userRepository.save(new User("USR-003", "Ravi Patel", "engineer@buildtrack.com", passwordEncoder.encode("engineer123"), "Site Engineer", "Active"));
            userRepository.save(new User("USR-004", "Neha Iyer", "accountant@buildtrack.com", passwordEncoder.encode("accountant123"), "Accountant", "Active"));

            // Seeding Projects
            projectRepository.save(new Project("PRJ-001", "City Center Apartments", "Urban Living Ltd.", "Chennai", new BigDecimal("12500000"), "Arun Kumar", LocalDate.of(2026, 1, 15), LocalDate.of(2026, 10, 30), "Active", 68, "Structural Work"));
            projectRepository.save(new Project("PRJ-002", "Riverside Office Complex", "Northstar Corp.", "Bengaluru", new BigDecimal("18600000"), "Meera Shah", LocalDate.of(2026, 2, 8), LocalDate.of(2026, 12, 20), "Active", 42, "Foundation"));
            projectRepository.save(new Project("PRJ-003", "Greenfield Public School", "Greenfield Trust", "Coimbatore", new BigDecimal("8900000"), "Vikram Singh", LocalDate.of(2025, 11, 12), LocalDate.of(2026, 7, 15), "On Hold", 79, "Interior Finishing"));
            projectRepository.save(new Project("PRJ-004", "Lakeview Community Hall", "City Council", "Mysuru", new BigDecimal("6200000"), "Priya Nair", LocalDate.of(2025, 8, 10), LocalDate.of(2026, 5, 25), "Completed", 100, "Completed"));
            projectRepository.save(new Project("PRJ-005", "Metro Warehouse Extension", "Metro Logistics", "Hyderabad", new BigDecimal("7400000"), "Arun Kumar", LocalDate.of(2026, 3, 20), LocalDate.of(2026, 9, 18), "Active", 31, "Site Preparation"));

            // Seeding Workers
            workerRepository.save(new Worker("WRK-101", "Ravi Patel", "Site Engineer", "+91 98765 43210", new BigDecimal("1800"), "City Center Apartments", "On Site"));
            workerRepository.save(new Worker("WRK-102", "Anil Verma", "Electrician", "+91 98234 56781", new BigDecimal("1200"), "Riverside Office Complex", "On Site"));
            workerRepository.save(new Worker("WRK-103", "Joseph Thomas", "Carpenter", "+91 97654 12340", new BigDecimal("1100"), "Greenfield Public School", "On Leave"));
            workerRepository.save(new Worker("WRK-104", "Sunil Das", "Supervisor", "+91 99876 54321", new BigDecimal("1500"), "Metro Warehouse Extension", "On Site"));
            workerRepository.save(new Worker("WRK-105", "Manoj Rao", "Mason", "+91 91234 87650", new BigDecimal("950"), "City Center Apartments", "Available"));
            workerRepository.save(new Worker("WRK-106", "Kiran Joshi", "Plumber", "+91 93456 78210", new BigDecimal("1150"), "Riverside Office Complex", "On Site"));
            workerRepository.save(new Worker("WRK-107", "Bala Kumar", "Labourer", "+91 90123 45678", new BigDecimal("700"), "Metro Warehouse Extension", "On Site"));
            workerRepository.save(new Worker("WRK-108", "Deepak Yadav", "Machine Operator", "+91 94567 12380", new BigDecimal("1400"), "City Center Apartments", "Available"));
            workerRepository.save(new Worker("WRK-109", "Suresh Babu", "Painter", "+91 95678 23490", new BigDecimal("900"), "Greenfield Public School", "On Site"));

            // Seeding Materials
            materialRepository.save(new Material("MAT-001", "Portland Cement", "Cement", 480.0, "bags", "BuildRight Supplies", new BigDecimal("204000"), "In Stock"));
            materialRepository.save(new Material("MAT-002", "TMT Steel Bars 12mm", "Steel", 8.5, "tons", "National Steel Co.", new BigDecimal("595000"), "In Stock"));
            materialRepository.save(new Material("MAT-003", "Red Clay Bricks", "Masonry", 2400.0, "pieces", "Classic Bricks", new BigDecimal("28800"), "Low Stock"));
            materialRepository.save(new Material("MAT-004", "River Sand", "Aggregate", 32.0, "tons", "Sunrise Aggregates", new BigDecimal("76800"), "In Stock"));
            materialRepository.save(new Material("MAT-005", "Exterior Paint", "Finishing", 18.0, "drums", "ColorPro Dealers", new BigDecimal("64800"), "Low Stock"));
            materialRepository.save(new Material("MAT-006", "PVC Pipes 4 inch", "Plumbing", 0.0, "pieces", "Flowline Products", new BigDecimal("0"), "Out of Stock"));

            // Seeding Expenses
            expenseRepository.save(new Expense("EXP-401", LocalDate.of(2026, 6, 10), "Weekly skilled labor wages", "Riverside Office Complex", "Labor", new BigDecimal("142500"), "Pending"));
            expenseRepository.save(new Expense("EXP-402", LocalDate.of(2026, 6, 10), "Weekly skilled labor wages", "Riverside Office Complex", "Labor", new BigDecimal("142500"), "Pending"));
            expenseRepository.save(new Expense("EXP-403", LocalDate.of(2026, 6, 8), "Excavator rental", "Metro Warehouse Extension", "Equipment", new BigDecimal("48000"), "Approved"));
            expenseRepository.save(new Expense("EXP-404", LocalDate.of(2026, 6, 6), "Electrical wiring materials", "Greenfield Public School", "Materials", new BigDecimal("67300"), "Pending"));
            expenseRepository.save(new Expense("EXP-405", LocalDate.of(2026, 6, 3), "Building permit fee", "Metro Warehouse Extension", "Permits", new BigDecimal("25000"), "Approved"));
            expenseRepository.save(new Expense("EXP-406", LocalDate.of(2026, 6, 1), "Site transport and fuel", "City Center Apartments", "Transport", new BigDecimal("31600"), "Pending"));

            // Seeding Daily Reports
            dailyReportRepository.save(new DailyReport("RPT-001", "PRJ-001", LocalDate.of(2026, 6, 12), 54, 4, 28, 8, 5, 3, 0, 2, 2, 2, 4, 35, 2.0, 68, "Concrete work started on the second-floor slab.", "Ravi Patel"));
            dailyReportRepository.save(new DailyReport("RPT-002", "PRJ-001", LocalDate.of(2026, 6, 11), 51, 7, 26, 8, 5, 3, 0, 2, 2, 2, 3, 30, 1.5, 66, "Roof casting preparation completed.", "Ravi Patel"));
            dailyReportRepository.save(new DailyReport("RPT-003", "PRJ-002", LocalDate.of(2026, 6, 12), 42, 3, 20, 10, 5, 3, 0, 2, 1, 1, 0, 24, 2.0, 42, "Foundation reinforcement inspection completed.", "Karthik Rao"));

            System.out.println("MySQL database seeded successfully.");
        }
    }
}
