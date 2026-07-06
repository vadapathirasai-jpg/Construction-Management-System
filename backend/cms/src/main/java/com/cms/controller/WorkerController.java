package com.cms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.cms.entity.Worker;
import com.cms.service.WorkerService;

@RestController
@RequestMapping("/workers")
@CrossOrigin(origins = "*")
public class WorkerController {

    @Autowired
    private WorkerService workerService;

    @PostMapping
    public Worker saveWorker(@RequestBody Worker worker) {
        return workerService.saveWorker(worker);
    }

    @GetMapping
    public List<Worker> getAllWorkers() {
        return workerService.getAllWorkers();
    }

    @GetMapping("/{id}")
    public Worker getWorkerById(@PathVariable String id) {
        return workerService.getWorkerById(id);
    }

    @PutMapping("/{id}")
    public Worker updateWorker(@PathVariable String id,@RequestBody Worker worker) {
        return workerService.updateWorker(id, worker);
    }
  

    @DeleteMapping("/{id}")
    public void deleteWorker(@PathVariable String id) {
        workerService.deleteWorker(id);
    }
}