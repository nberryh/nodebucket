/**
 * Title: employee.interface.ts
 * Author: Nolan Berryhill
 * Date: 1/24/2024
 */

// imports statements
import { Item } from './item.interface';

// Export interface
export interface Employee {
  empId: number;
  todo: Item [];
  done: Item [];
}